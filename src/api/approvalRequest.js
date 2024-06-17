import approvalRequest from "../lib/db-models/approvalRequest.js";
import ApprovalRequestValidations from "../lib/db-models/approvalRequestValidations.js";
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
    query.approvers = apiUtils.explode(query.approvers);
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

      // check if user is in approval chain
      let inApprovalChain = false;
      for (const approver of approvalRequest.approvalStatusActivity){
        if ( approver.employeeKerberos === kerberos ) {
          inApprovalChain = true;
          break;
        }
      }

      if ( !isOwnRequest && !inApprovalChain ) return apiUtils.do403(res);
    }

    res.json(results);
  });

  api.post('/approval-request', protect('hasBasicAccess'), async (req, res) => {
    const data = req.body || {};
    const kerberos = req.auth.token.id;
    const forceValidation = req.query.hasOwnProperty('force-validation');

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
    const result = await approvalRequest.createRevision(data, employeeObj, forceValidation);
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

  api.post('/approval-request/:id/status-update', protect('hasBasicAccess'), async (req, res) => {
    const validations = new ApprovalRequestValidations();

    // ensure action is valid
    const payload = req.body || {};
    const validActions = validations.approvalStatusActions.map(a => a.value);
    if ( !validActions.includes(payload.action) ) {
      return res.status(400).json({error: true, message: 'Invalid action.'});
    }

    // ensure approval request exists
    const approvalRequestId = typeTransform.toPositiveInt(req.params.id);
    if ( !approvalRequestId ) {
      return res.status(400).json({error: true, message: 'Invalid approvalRequestId.'});
    }
    let approvalRequestObj = await approvalRequest.get({requestIds: [approvalRequestId], isCurrent: true});
    if ( approvalRequestObj.error ) {
      console.error('Error in POST /approval-request/:id/status-update', approvalRequest.error);
      return res.status(500).json({error: true, message: 'Error getting approval request.'});
    }
    if ( !approvalRequestObj.data.length ) {
      return res.status(404).json({error: true, message: 'Approval request not found.'});
    }
    approvalRequestObj = approvalRequestObj.data[0];

    // bail if approval request cannot be updated
    const finalStatuses = validations.validApprovalStatuses.filter(s => s.isFinal).map(s => s.value);
    if ( finalStatuses.includes(approvalRequestObj.approvalStatus) ) {
      return res.status(400).json({error: true, message: 'Approval request cannot be updated.'});
    }

    // ensure user is authorized to perform action
    const kerberos = req.auth.token.id;
    const action = validations.approvalStatusActions.find(a => a.value === payload.action);
    if ( action.actor === 'submitter' && approvalRequestObj.employeeKerberos !== kerberos ) {
      return apiUtils.do403(res);
    }
    // todo check if in approval chain


    if ( action.value === 'submit' ){
      const result = await approvalRequest.submitDraft(approvalRequestObj);
      if ( result.error && result.is400 ) {
        return res.status(400).json(result);
      }
      if ( result.error ) {
        console.error('Error in POST /approval-request/:id/status-update', result.error);
        return res.status(500).json({error: true, message: 'Error submitting approval request.'});
      }
      return res.json(result);
    }

    // todo handle other actions

    return res.status(500).json({error: true, message: 'Error performing action on approval request.'});

  });

  /**
   * @description Returns the employees that need to approve the given approval request based on the submitter and funding sources selected
   * Called before an approval request is actually submitted.
   */
  api.get('/approval-request/:id/approval-chain', protect('hasBasicAccess'), async (req, res) => {
    const kerberos = req.auth.token.id;
    const approvalRequestId = typeTransform.toPositiveInt(req.params.id);
    if ( !approvalRequestId ) {
      return res.status(400).json({error: true, message: 'Invalid approvalRequestId.'});
    }
    const approvalRequestObj = await approvalRequest.get({requestIds: [approvalRequestId], isCurrent: true});
    if ( approvalRequestObj.error ) {
      console.error('Error in GET /approval-request/:id/approval-chain', approvalRequest.error);
      return res.status(500).json({error: true, message: 'Error getting approval request.'});
    }
    if ( !approvalRequestObj.data.length ) {
      return res.status(404).json({error: true, message: 'Approval request not found.'});
    }
    const isOwnRequest = approvalRequestObj.data[0].employeeKerberos === kerberos;
    if ( !isOwnRequest && !req.auth.token.hasAdminAccess ) {
      return apiUtils.do403(res);
    }

    const approvalChain = await approvalRequest.makeApprovalChain(approvalRequestObj.data[0]);
    if ( approvalChain.error ) {
      console.error('Error in GET /approval-request/:id/approval-chain', approvalChain.error);
      return res.status(500).json({error: true, message: 'Error getting approval chain.'});
    }

    // transform chain object to match format in approvalRequest object
    const out = approvalChain.map((chainObj) => {
      return {
        action: 'approval-needed',
        employee: (new IamEmployeeObjectAccessor(chainObj.employee)).travelAppObject,
        approverTypes: chainObj.approverTypes,
      };
    });
    return res.json(out);
  });

};
