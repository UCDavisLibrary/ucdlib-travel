import approvalRequest from "../lib/db-models/approvalRequest.js";
import employee from "../lib/db-models/employee.js";

import protect from "../lib/protect.js";
import IamEmployeeObjectAccessor from "../lib/utils/iamEmployeeObjectAccessor.js";
import urlUtils from "../lib/utils/urlUtils.js";
import apiUtils from "../lib/utils/apiUtils.js";
import typeTransform from "../lib/utils/typeTransform.js";

export default (api) => {

  /**
   * @api {get} /approval-request Get approval requests
   * @description Query for approval requests. See approval request "get" db model method for query options.
   *
   */
  api.get('/approval-request', protect('hasBasicAccess'), async (req, res) => {
    const kerberos = req.auth.token.id;

    // convert query string to camel case object
    const query = urlUtils.queryToCamelCase(req.query);

    // pagination
    query.page = apiUtils.getPageNumber(req);
    delete query.pageSize;

    // query args that need to be arrays
    query.revisionIds = apiUtils.explode(query.revisionIds, true);
    query.requestIds = apiUtils.explode(query.requestIds, true);
    query.employees = apiUtils.explode(query.employees);

    // do query
    const results = await approvalRequest.get(query);
    if ( results.error ) {
      console.error('Error in GET /approval-request', results.error);
      return res.status(500).json({error: true, message: 'Error getting approval requests.'});
    }

    // check if user is authorized to view all results
    if ( req.auth.token.hasAdminAccess ) return res.json(results);
    for (const approvalRequest of results.data) {
      const isOwnRequest = approvalRequest.employeeKerberos === kerberos;

      // todo check if in approval chain
      const inApprovalChain = false;

      if ( !isOwnRequest && !inApprovalChain ) return apiUtils.do403(res);
    }

    res.json(results);
  });

  api.post('/approval-request', protect('hasBasicAccess'), async (req, res) => {
    const data = req.body || {};
    const kerberos = req.auth.token.id;

    // check if this is a revision of an existing request and if so, ensure user is authorized
    if ( data.approvalRequestId ) {
      const approvalRequestId = typeTransform.toPositiveInt(data.approvalRequestId);
      if ( !approvalRequestId ) {
        return res.status(400).json({error: true, message: 'Invalid approvalRequestId.'});
      }
      const existingRequest = await approvalRequest.get({requestIds: [approvalRequestId]});
      if ( existingRequest.error ) {
        console.error('Error in POST /approval-request', existingRequest.error);
        return res.status(500).json({error: true, message: 'Error creating approval request.'});
      }
      const existingKerberos = (existingRequest.data.find(r => r.isCurrent) || {}).employeeKerberos;
      if ( existingKerberos !== kerberos ) {
        return apiUtils.do403(res);
      }
    }

    // get full employee object (with department) for logged in user
    let employeeObj = await employee.getIamRecordById(kerberos);
    if ( employeeObj.error ) {
      console.error('Error getting employee object in POST /approval-request', employeeObj.error);
      return res.status(500).json({error: true, message: 'Error creating approval request.'});
    }
    employeeObj = (new IamEmployeeObjectAccessor(employeeObj.res)).travelAppObject;
    delete data.employeeKerberos;

    // set status fields
    data.approvalStatus = data.approvalStatus === 'draft' ? 'draft' : 'submitted';
    data.reimbursementStatus = data.noExpenditures ? 'not-required' : 'not-submitted';

    // create approval request revision
    const result = await approvalRequest.createRevision(data, employeeObj);
    if ( result.error && result.is400 ) {
      return res.status(400).json(result);
    }
    if ( result.error ) {
      console.error('Error in POST /approval-request', result.error);
      return res.status(500).json({error: true, message: 'Error creating approval request.'});
    }

    res.json(result);
  });

  api.delete('/approval-request/:id', protect('hasBasicAccess'), async (req, res) => {

    // try to delete draft
    const result = await approvalRequest.deleteDraft(req.params.id, req.auth.token.id);

    // handle errors
    if ( result.error && result.is400 ) {
      return res.status(400).json(result);
    }
    if ( result.error && result.is403 ) {
      return apiUtils.do403(res);
    }
    if ( result.error ) {
      console.error('Error in DELETE /approval-request/:id', result.error);
      return res.status(500).json({error: true, message: 'Error deleting approval request.'});
    }

    res.json(result);

  });

};
