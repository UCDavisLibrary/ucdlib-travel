import protect from "../lib/protect.js";
import uploads from "../lib/utils/uploads.js";
import typeTransform from "../lib/utils/typeTransform.js";
import reports from "../lib/db-models/reports.js";
import urlUtils from "../lib/utils/urlUtils.js";
import apiUtils from "../lib/utils/apiUtils.js";
import reimbursementRequest from "../lib/db-models/reimbursementRequest.js";
import approvalRequest from "../lib/db-models/approvalRequest.js";
import employee from "../lib/db-models/employee.js";
import IamEmployeeObjectAccessor from "../lib/utils/iamEmployeeObjectAccessor.js";
import log from "../lib/utils/log.js";


export default (api) => {

  api.get('/reimbursement-request', protect('hasBasicAccess'), async (req, res) => {
    const kerberos = req.auth.token.id;
    const reportAccess = await reports.getAccessLevel(req.auth.token);
    if ( reportAccess.error ) {
      log.error('Error fetching access level', reportAccess);
      return res.status(500).json({error: true, message: 'Error fetching access level'});
    }

    // convert query string to camel case object
    const query = urlUtils.queryToCamelCase(req.query);

    // query args that need to be arrays
    query.approvalRequestIds = apiUtils.explode(query.approvalRequestIds, true);
    query.reimbursementRequestIds = apiUtils.explode(query.reimbursementRequestIds, true);
    query.status = apiUtils.explode(query.status);

    // pagination
    query.page = apiUtils.getPageNumber(req);
    const pageSize = apiUtils.getPageSize(req);
    delete query.pageSize;

    // allow pagesize to be set if querying for a single approval request
    const isSingleRequest = query.approvalRequestIds.length === 1;
    if ( isSingleRequest ) query.pageSize = pageSize

    // do query
    const results = await reimbursementRequest.get(query);
    if ( results.error ){
      console.error('Error in GET /reimbursement-request', results.error);
      return res.status(500).json({error: true, message: 'Error getting reimbursement requests.'});
    }

    if ( !results.total ) return res.json(results);

    // do auth - which is determined by associated approval request
    const approvalRequestIds = [...(new Set(results.data.map(rr => rr.approvalRequestId)))];
    let arQuery = {
      requestIds: approvalRequestIds,
      isCurrent: true,
      pageSize: -1
    };
    const approvalRequests = await approvalRequest.get(arQuery);
    if ( approvalRequests.error ){
      console.error('Error in GET /reimbursement-request', approvalRequests.error);
      return res.status(500).json({error: true, message: 'Error when authorizing access to reimbursement requests.'});
    }

    if ( query.includeApprovalRequest ) {
      results.data.forEach(rr => {
        rr.approvalRequest = approvalRequests.data.find(ar => ar.approvalRequestId === rr.approvalRequestId);
      });
    }

    if ( query.includeReimbursedTotal ) {
      const ids = results.data.map(rr => rr.reimbursementRequestId);
      if ( ids.length ) {
        const transactions = await reimbursementRequest.getFundTransactions(ids);
        if ( transactions.error ) {
          console.error('Error in GET /reimbursement-request', transactions.error);
          return res.status(500).json({error: true, message: 'Error getting reimbursement transactions.'});
        }
        const reimbursedTotals = transactions.reduce((acc, t) => {
          if ( !acc[t.reimbursementRequestId] ) acc[t.reimbursementRequestId] = 0;
          if ( t.reimbursementStatus === 'submitted' ) {
            acc[t.reimbursementRequestId] += t.amount;
          }
          return acc;
        }, {});

        results.data.forEach(rr => {
          rr.reimbursedTotal = reimbursedTotals[rr.reimbursementRequestId] || 0;
        });
      }

    }

    if ( req.auth.token.hasAdminAccess || reportAccess.hasFullAccess ) return res.json(results);

    for (const ar of approvalRequests.data) {
      const isOwnRequest = ar.employeeKerberos === kerberos;
      const inApprovalChain = ar.approvalStatusActivity.some(a => a.employeeKerberos === kerberos);
      const departmentAccess = reportAccess.departmentRestrictions.includes(ar.departmentId);
      if ( !isOwnRequest && !inApprovalChain && !departmentAccess ) return apiUtils.do403(res);
    }

    return res.json(results);

  })

  api.post(
    '/reimbursement-request',
    protect('hasBasicAccess'),
    uploads.uploadReiumbursementReceipts(),
    createReimbursementRequest
  );

  api.post('/reimbursement-transaction', protect('hasAdminAccess'), async (req, res) => {
    const data = req.body || {};
    const kerberos = req.auth.token.id;

    // get full employee object (with department) for logged in user
    let employeeObj = await employee.getIamRecordById(kerberos);
    if ( employeeObj.error ) {
      console.error('Error getting employee object in POST /approval-request', employeeObj.error);
      return res.status(500).json({error: true, message: 'Error creating approval request.'});
    }
    employeeObj = (new IamEmployeeObjectAccessor(employeeObj.res)).travelAppObject;

    const result = await reimbursementRequest.createFundTransaction(data, employeeObj);
    if ( result.error && result.is400 ) {
      return res.status(400).json(result);
    }
    if ( result.error ) {
      console.error('Error in POST /reimbursement-transaction', result.error);
      return res.status(500).json({error: true, message: 'Error creating reimbursement transaction.'});
    }

    res.json(result);
  });

  api.put('/reimbursement-transaction', protect('hasAdminAccess'), async (req, res) => {
    const data = req.body || {};
    const kerberos = req.auth.token.id;

    // get full employee object (with department) for logged in user
    let employeeObj = await employee.getIamRecordById(kerberos);
    if ( employeeObj.error ) {
      console.error('Error getting employee object in POST /approval-request', employeeObj.error);
      return res.status(500).json({error: true, message: 'Error creating approval request.'});
    }
    employeeObj = (new IamEmployeeObjectAccessor(employeeObj.res)).travelAppObject;

    const result = await reimbursementRequest.updateFundTransaction(data, employeeObj);
    if ( result.error && result.is400 ) {
      return res.status(400).json(result);
    }

    if ( result.error ) {
      console.error('Error in PUT /reimbursement-transaction', result.error);
      return res.status(500).json({error: true, message: 'Error updating reimbursement transaction.'});
    }

    res.json(result);
  });

  api.get('/reimbursement-transaction', protect('hasBasicAccess'), async (req, res) => {
    const kerberos = req.auth.token.id;
    const reportAccess = await reports.getAccessLevel(req.auth.token);
    if ( reportAccess.error ) {
      log.error('Error fetching access level', reportAccess);
      return res.status(500).json({error: true, message: 'Error fetching access level'});
    }
    const query = urlUtils.queryToCamelCase(req.query);

    const reimbursementRequestIds = apiUtils.explode(query.reimbursementRequestIds, true);
    if ( !reimbursementRequestIds.length ) return res.status(400).json({error: 'Invalid reimbursement request id'});
    if ( reimbursementRequestIds.length > 100 ) return res.status(400).json({error: 'Too many reimbursement request ids'});

    const results = await reimbursementRequest.getFundTransactions(reimbursementRequestIds);
    if ( results.error ) {
      console.error('Error in GET /reimbursement-transaction', results);
      return res.status(500).json({error: true, message: 'Error getting reimbursement transactions.'});
    }

    if ( req.auth.token.hasAdminAccess || reportAccess.hasFullAccess ) return res.json(results);

    const reimbursementRequests = await reimbursementRequest.get({reimbursementRequestIds, pageSize: -1});
    if ( reimbursementRequests.error ) {
      console.error('Error in GET /reimbursement-transaction', reimbursementRequests.error);
      return res.status(500).json({error: true, message: 'Error getting reimbursement requests.'});
    }

    const approvalRequestIds = [...(new Set(reimbursementRequests.data.map(rr => rr.approvalRequestId)))];
    let arQuery = {
      requestIds: approvalRequestIds,
      isCurrent: true,
      pageSize: -1
    };
    const approvalRequests = await approvalRequest.get(arQuery);
    if ( approvalRequests.error ){
      console.error('Error in GET /reimbursement-request', approvalRequests.error);
      return res.status(500).json({error: true, message: 'Error when authorizing access to reimbursement requests.'});
    }

    if ( query.includeApprovalRequest ) {
      results.data.forEach(rr => {
        rr.approvalRequest = approvalRequests.data.find(ar => ar.approvalRequestId === rr.approvalRequestId);
      });
    }

    for (const ar of approvalRequests.data) {
      const isOwnRequest = ar.employeeKerberos === kerberos;
      const inApprovalChain = ar.approvalStatusActivity.some(a => a.employeeKerberos === kerberos);
      const departmentAccess = reportAccess.departmentRestrictions.includes(ar.departmentId);
      if ( !isOwnRequest && !inApprovalChain && !departmentAccess ) return apiUtils.do403(res);
    }

    return res.json(results);

  });
};

const createReimbursementRequest = async (req, res) => {
  const kerberos = req.auth.token.id;

  // parse reimbursementRequest data
  const data = typeTransform.parseJsonString(req.body.reimbursementRequest, {});
  if ( ! typeof data === 'object' || !Object.keys(data).length) {
    return res.status(400).json({ error : 'Invalid reimbursement request data' });
  }

  // authorize user
  const approvalRequestId = typeTransform.toPositiveInt(data.approvalRequestId);
  if ( !approvalRequestId ) {
    uploads.deleteUploadedFiles(req.files);
    return res.status(400).json({ error: 'Invalid approval request id' });
  }
  let approvalRequestData = await approvalRequest.get({requestIds: [approvalRequestId], isCurrent: true});
  if ( approvalRequestData.error ) {
    uploads.deleteUploadedFiles(req.files);
    console.error('Error in POST /reimbursement-request', approvalRequestData.error);
    return res.status(500).json({ error: true, message: 'Error creating reimbursement request'});
  }
  if ( !approvalRequestData.total ) {
    uploads.deleteUploadedFiles(req.files);
    return res.status(400).json({ error: 'Approval request not found' });
  }
  approvalRequestData = approvalRequestData.data[0];
  if ( approvalRequestData.employeeKerberos !== kerberos ) {
    uploads.deleteUploadedFiles(req.files);
    return res.status(403).json({ error: 'You are not authorized to submit a reimbursement request for this travel request.' });
  }

  // add uploaded files to data
  data.receipts = (Array.isArray(data.receipts) ? data.receipts : []).map((receipt, i) => {
    receipt = receipt || {};
    const file = req.files?.[i];
    if ( !file ) return receipt;
    receipt.filePath = file.path;
    receipt.fileType = file.mimetype;
    receipt.uploadedBy = kerberos;
    receipt.deleted = false;
    receipt.deletedBy = null;
    receipt.deletedAt = null;
    return receipt;
  });

  const result = await reimbursementRequest.create(data);

  if ( result.error ) {
    uploads.deleteUploadedFiles(req.files);
    if ( result.is400 ) {
      return res.status(400).json(result);
    }
    console.error('Error in POST /reimbursement-request', result.error);
    return res.status(500).json({ error: true, message: 'Error creating reimbursement request'});
  }

  res.json(result);
};

