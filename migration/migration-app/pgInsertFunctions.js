import pg from "./pg.js";

import validations from "./approvalRequestValidations.js";
import employeeModel from "./employee.js";
import fundingSourceModel from "./fundingSource.js"

import EntityFields from "../utils/EntityFields.js";
import typeTransform from "../utils/typeTransform.js";
import IamEmployeeObjectAccessor from "../utils/iamEmployeeObjectAccessor.js";
import applicationOptions from "../utils/applicationOptions.js";
import objectUtils from "../utils/objectUtils.js";

class ApprovalRequest {

  constructor(){

  }
    /**
   * @description Insert or update an employee record in the local database as part of a transaction
   * @param {*} client - A connected pg pool that has already 'begun' e.g:
   *  client = await pg.pool.connect()
   *  await client.query('BEGIN')
   * @param {Object} employee - A basic employee record object with the following properties:
   * - kerberos: String (required)
   * - firstName: String (optional)
   * - lastName: String (optional)
   * - department: Object (optional) - with the following properties:
   *  - departmentId: String (required)
   *  - label: String (optional)
   */
     async upsertInTransaction(client, employee){

        if ( !employee.kerberos ) {
          throw new Error('Employee record must have a kerberos id.');
        }
    
        // upsert department if it exists
        const departmentId = employee?.department?.departmentId;
        if ( departmentId ) {
          const label = employee.department.label || '';
          const departmentRes = await client.query('SELECT * FROM department WHERE department_id = $1', [departmentId]);
          if ( departmentRes.rowCount ) {
            if ( label && departmentRes.rows[0].label !== label ) {
              await client.query('UPDATE department SET label = $1 WHERE department_id = $2', [label, departmentId]);
            }
          } else {
            await client.query('INSERT INTO department (department_id, label) VALUES ($1, $2)', [departmentId, label]);
          }
        }
    
        // upsert employee record
        const kerberos = employee.kerberos;
        const firstName = employee.firstName || '';
        const lastName = employee.lastName || '';
        const employeeRes = await client.query('SELECT * FROM employee WHERE kerberos = $1', [kerberos]);
        if ( employeeRes.rowCount ) {
          const existingEmployee = employeeRes.rows[0];
          if ( firstName && lastName && (existingEmployee.first_name !== firstName || existingEmployee.last_name !== lastName) ) {
            await client.query('UPDATE employee SET first_name = $1, last_name = $2 WHERE kerberos = $3', [firstName, lastName, kerberos]);
          }
        } else {
          await client.query('INSERT INTO employee (kerberos, first_name, last_name) VALUES ($1, $2, $3)', [kerberos, firstName, lastName]);
        }
    
        // check department membership based on current date and department id
        // update if necessary
        if ( !departmentId ) return;
        const now = new Date();
        const membershipRes = await client.query('SELECT * FROM employee_department WHERE employee_kerberos = $1 AND department_id = $2 AND start_date <= $3 AND (end_date IS NULL OR end_date >= $3)', [kerberos, departmentId, now]);
        if ( membershipRes.rowCount ) return;
        await client.query('INSERT INTO employee_department (employee_kerberos, department_id, start_date) VALUES ($1, $2, $3)', [kerberos, departmentId, now]);
        await client.query('UPDATE employee_department SET end_date = $1 WHERE employee_kerberos = $2 AND department_id != $3 AND end_date IS NULL', [now, kerberos, departmentId]);
      }


  /**
   * @description Create a new approval request revision
   * @param {Object} data - the approval request revision data - see entityFields for expected fields (json names)
   * @param {Object} submittedBy - the employee object of the employee submitting the request
   *  - if data.employeeKerberos is not set, this object will be used to set the employeeKerberos field
   * @param {Boolean} forceValidation - whether to force validation even if not required (aka for a draft revision)
   * @returns {Object}
   */
  async createRevision(data, connection){

    // if submittedBy is provided, assign approval request revision to that employee
    // if ( submittedBy ){
    //   data.employee = submittedBy;
    //   delete data.employeeKerberos;
    // }

    // data = this.entityFields.toDbObj(data);

    // remove system generated fields
    delete data.approval_request_revision_id;
    delete data.is_current;
    delete data.submitted_at
    delete data.approval_status_activity;

    // // do validation
    // data.validated_successfully = false;
    // if ( forceValidation ) data.forceValidation = true;
    // const validation = await this.entityFields.validate(data, ['employee_allocation_id']);
    // if ( !validation.valid ) {
    //   return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    // }
    // if ( data.forceValidation || data.approval_status !== 'draft' ){
    //   data.validated_successfully = true;
    // }
    // delete data.forceValidation;

    // extract employee object from data
    const employee = data.employee_kerberos ? {kerberos: data.employee.kerberos} : data.employee;
    data.employee_kerberos = data.employee_kerberos || data.employee.kerberos;
    delete data.employee;

    // set funding source to "No funding/program time only" if no expenditures
    // required to determine approval chain (still need supervisor approval)
    if ( data.no_expenditures ){
      data.funding_sources = [{fundingSourceId: 8, amount: 0}];
      data.expenditures = [];
    }

    // prep data for transaction
    let out = {};
    let approvalRequestRevisionId;
    const fundingSources = (data.funding_sources || []).filter(fs => fs.amount || fs.fundingSourceId);
    delete data.funding_sources;
    const expenditures = data.expenditures || [];
    delete data.expenditures;

    // start transaction
    const client = await connection.connect();
    try {
      await client.query('BEGIN');

      // upsert employee and department
      await upsertInTransaction(client, employee);

      // mark any previous revisions as not current
      if ( data.approval_request_id ){
        const sql = `UPDATE approval_request SET is_current = false WHERE approval_request_id = $1`;
        await client.query(sql, [data.approval_request_id]);
      }

      // insert approval request revision
      data = pg.prepareObjectForInsert(data);
      const sql = `INSERT INTO approval_request (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING approval_request_revision_id`;
      const res = await client.query(sql, data.values);
      approvalRequestRevisionId = res.rows[0].approval_request_revision_id;

      // insert funding sources
      if ( !data.no_expenditures ){
        for (let fs of fundingSources){
          fs.approvalRequestRevisionId = approvalRequestRevisionId;
          delete fs.approvalRequestFundingSourceId;
          fs = this.fundingSourceFields.toDbObj(fs);
          fs = pg.prepareObjectForInsert(fs);
          const sql = `INSERT INTO approval_request_funding_source (${fs.keysString}) VALUES (${fs.placeholdersString})`;
          await client.query(sql, fs.values);
        }
      }

      // insert expenditures
      if ( !data.no_expenditures ){
        for (let expenditure of expenditures) {
          expenditure.approvalRequestRevisionId = approvalRequestRevisionId;
          delete expenditure.approvalRequestExpenditureId;
          expenditure = this.expenditureFields.toDbObj(expenditure);
          expenditure = pg.prepareObjectForInsert(expenditure);
          const sql = `INSERT INTO approval_request_expenditure (${expenditure.keysString}) VALUES (${expenditure.placeholdersString})`;
          await client.query(sql, expenditure.values);
        }
      }

      await client.query('COMMIT');

    } catch (e) {
        await client.query('ROLLBACK');
        out = {error: e};
    } finally {
      client.end();
    }

    if ( out.error ) return out;

    // get and return full record that was just created
    out = await this.get({revisionIds: [approvalRequestRevisionId]});
    if ( out.error ) {
      return out;
    }
    out = out.data[0];

    return out;

  }

  /**
   * @description Construct an approval chain for an approval request based on funding sources selected
   * @param {Object|Number} approvalRequestObjectOrId - approval request object or approval request ID
   * @returns {Object|Array} - If error returns error object, otherwise returns array of approvers with properties:
   *  - approvalTypeOrder {Integer} - order of approval type
   *  - employeeOrder {Integer} - order of employee within approval type
   *  - approverTypes {Array} - array of approver types with properties:
   *   - approverTypeId {Integer} - approver type ID
   *   - approverTypeLabel {String} - approver type label
   * - employeeKerberos {String} - kerberos of approver
   * - employee {Object} - employee record of approver
   */
  async makeApprovalChain(approvalRequestObjectOrId){

    const { approvalRequest, approvalRequestError } = await this._getApprovalRequest(approvalRequestObjectOrId);
    if ( approvalRequestError ) return approvalRequestError;

    // get full funding source objects
    const fundingSourceIds = (approvalRequest.fundingSources || []).map(fs => fs.fundingSourceId);
    if ( !fundingSourceIds.length ) return [];
    const fundingSources = await fundingSourceModel.get({ids: fundingSourceIds});
    if ( fundingSources.error ) return fundingSources;

    // get employee record of employee who submitted the request
    if ( !approvalRequest.employeeKerberos ) return {error: true, message: 'Employee kerberos not found', is400: true};
    let submitter = await employeeModel.getIamRecordById(approvalRequest.employeeKerberos);
    if ( submitter.error ) return submitter;
    submitter = submitter.res;

    // extract approvers from funding source and flatten
    // approver will have properties:
    // approvalTypeOrder, employeeOrder, approverTypeLabel, approverTypeId,employeeId, employeeIdType
    const approvers = [];
    for (const fs of fundingSources){
      for (const ap of (fs.approverTypes || [])){

        // if system generated, we determine the approver employee
        if ( ap.systemGenerated ){

          // submitter supervisor
          if ( ap.approverTypeId == 1 ){

            if ( !submitter?.supervisor?.iamId ) {
              return {error: true, message: 'Submitter supervisor not found'};
            }
            approvers.push({
              approvalTypeOrder: ap.approvalOrder,
              employeeOrder: 0,
              approverTypeLabel: ap.label,
              approverTypeId: ap.approverTypeId,
              employeeId: submitter.supervisor.iamId,
              employeeIdType: 'iam-id'
            });

          // submitter department head
          } else if ( ap.approverTypeId == 2 ){

            // bail if submitter has no department head and is not department head
            if ( !submitter?.departmentHead?.iamId && !(submitter?.groups || []).find(g => g.partOfOrg && g.isHead) ) {
              return {error: true, message: 'Submitter department head not found'};
            }

            approvers.push({
              approvalTypeOrder: ap.approvalOrder,
              employeeOrder: 0,
              approverTypeLabel: ap.label,
              approverTypeId: ap.approverTypeId,
              employeeId: submitter.departmentHead.iamId,
              employeeIdType: 'iam-id'
            });

          // a system generated approver we don't know how to handle
          } else {
            return {error: true, message: 'Invalid system generated approver type'};
          }

        // not system generated, we use the employee id provided
        } else {
          if ( !ap.employees || !ap.employees.length ) return {error: true, message: 'No employees found for approver type'};
          for (const employee of ap.employees ){
            if ( !employee.kerberos ) return {error: true, message: 'Employee kerberos not found'};
            approvers.push({
              approvalTypeOrder: ap.approvalOrder,
              employeeOrder: employee.approvalOrder,
              approverTypeLabel: ap.label,
              approverTypeId: ap.approverTypeId,
              employeeId: employee.kerberos,
              employeeIdType: 'user-id'
            });
          }
        }
      }
    }

    // retrieve employee records for each approver
    const approverEmployeeRecords = [];
    const promises = [];
    let promiseIndex = 0;
    for (const approver of approvers) {
      const id = `${approver.employeeIdType}--${approver.employeeId}`;
      if ( !approverEmployeeRecords.find(a => a.id === id)) {
        promises.push(employeeModel.getIamRecordById(approver.employeeId, approver.employeeIdType));
        approverEmployeeRecords.push({id, promiseIndex});
        promiseIndex += 1;
      }
    }
    const resolvedPromises = await Promise.allSettled(promises);
    for ( const i in resolvedPromises ){
      const resolvedPromise = resolvedPromises[i];
      if ( resolvedPromise.status === 'rejected' ){
        return {error: true, message: 'Error getting approver employee record'};
      }
      if ( resolvedPromise.value.error ){
        return resolvedPromise.value;
      }

      const approver = approverEmployeeRecords.find(a => a.promiseIndex == i);
      approver.employee = resolvedPromise.value.res;
    }

    // merge the employee records with the approver records into a unique array of employee approvers
    const uniqueApprovers = [];
    for ( const approver of approvers ){
      const employeeRecord = approverEmployeeRecords.find(a => a.id === `${approver.employeeIdType}--${approver.employeeId}`);
      const employeeKerberos = employeeRecord.employee.user_id;
      if ( !employeeKerberos ) return {error: true, message: 'Approver kerberos is missing from employee record'};
      let uniqueRecord = uniqueApprovers.find(a => a.employeeKerberos === employeeKerberos);
      if ( !uniqueRecord ){
        uniqueRecord = {approvalTypeOrder: approver.approvalTypeOrder, employeeOrder: approver.employeeOrder, approverTypes: []};
        uniqueApprovers.push(uniqueRecord);
      };
      uniqueRecord.employeeKerberos = employeeKerberos;
      uniqueRecord.employee = employeeRecord.employee;
      if ( approver.approvalTypeOrder < uniqueRecord.approvalTypeOrder ) uniqueRecord.approvalTypeOrder = approver.approvalTypeOrder;
      if ( approver.employeeOrder < uniqueRecord.employeeOrder ) uniqueRecord.employeeOrder = approver.employeeOrder;
      if ( !uniqueRecord.approverTypes.find(at => at.approverTypeId === approver.approverTypeId)){
        uniqueRecord.approverTypes.push({approverTypeId: approver.approverTypeId, approverTypeLabel: approver.approverTypeLabel});
      }
    }

    // sort by approval type order, then by employee order
    uniqueApprovers.sort((a, b) => {
      if ( a.approvalTypeOrder !== b.approvalTypeOrder ) return a.approvalTypeOrder - b.approvalTypeOrder;
      return a.employeeOrder - b.employeeOrder
    });

    return uniqueApprovers;
  }

  /**
   * @description Submit an existing approval request draft for approval
   * @param {Object|Number} approvalRequestObjectOrId - approval request object or approval request ID
   * @returns {Object} - {success: true} or {error: true}
   */
  async submitDraft(approvalRequestObjectOrId){
    const { approvalRequest, approvalRequestError, approvalRequestId } = await this._getApprovalRequest(approvalRequestObjectOrId);
    if ( approvalRequestError ) return approvalRequestError;

    // ensure approval request is in draft status
    if ( approvalRequest.approvalStatus !== 'draft' ) return {error: true, message: 'Approval request must be in draft status', is400: true};

    // get approval chain
    const approvalChain = await this.makeApprovalChain(approvalRequest);
    if ( approvalChain.error ) return approvalChain;

    // do transaction
    const approvalRequestRevisionId = approvalRequest.approvalRequestRevisionId;
    const client = await pg.pool.connect();
    const submittedAt = new Date();
    try {
      await client.query('BEGIN');

      let data, sql;

      // insert submission to approval status activity table
      // not technically approval activity, but using the same table makes things easier
      data = {
        approval_request_revision_id: approvalRequestRevisionId,
        approver_order: 0,
        action: 'submit',
        employee_kerberos: approvalRequest.employeeKerberos
      }
      data = pg.prepareObjectForInsert(data);
      sql = `INSERT INTO approval_request_approval_chain_link (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING approval_request_approval_chain_link_id`;
      const chainRes = await client.query(sql, data.values);
      const approvalRequestApprovalChainLinkId = chainRes.rows[0].approval_request_approval_chain_link_id;

      data = {
        approval_request_approval_chain_link_id: approvalRequestApprovalChainLinkId,
        approver_type_id: 4
      }
      data = pg.prepareObjectForInsert(data);
      sql = `INSERT INTO link_approver_type (${data.keysString}) VALUES (${data.placeholdersString})`;
      await client.query(sql, data.values);

      // insert approval chain links
      for (const [index, approver] of approvalChain.entries()){

        // upsert employee and department
        const employee = new IamEmployeeObjectAccessor(approver.employee)
        await employeeModel.upsertInTransaction(client, employee.travelAppObject);

        // insert into approval chain table
        data = {
          approval_request_revision_id: approvalRequestRevisionId,
          approver_order: index,
          action: 'approval-needed',
          employee_kerberos: employee.kerberos
        };
        data = pg.prepareObjectForInsert(data);
        sql = `INSERT INTO approval_request_approval_chain_link (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING approval_request_approval_chain_link_id`;
        const res = await client.query(sql, data.values);
        const approvalRequestApprovalChainLinkId = res.rows[0].approval_request_approval_chain_link_id;

        // insert approver type mappings
        for ( const approverType of approver.approverTypes ){
          data = {
            approval_request_approval_chain_link_id: approvalRequestApprovalChainLinkId,
            approver_type_id: approverType.approverTypeId
          };
          data = pg.prepareObjectForInsert(data);
          sql = `INSERT INTO link_approver_type (${data.keysString}) VALUES (${data.placeholdersString})`;
          await client.query(sql, data.values);
        }
      }

      // update approval request status to 'submitted'
      data = {
        approval_status: 'submitted',
        submitted_at: submittedAt
      };
      const updateClause = pg.toUpdateClause(data);
      sql = `
        UPDATE approval_request
        SET ${updateClause.sql}
        WHERE approval_request_revision_id = $${updateClause.values.length + 1}
      `;
      await client.query(sql, [...updateClause.values, approvalRequestRevisionId]);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      return {error: e};
    } finally {
      client.release();
    }

    return {success: true, approvalRequestId, approvalRequestRevisionId};
  }

  async doRequesterAction(approvalRequestObjectOrId, actionPayload){

    // get approval request
    const { approvalRequest, approvalRequestError, approvalRequestId } = await this._getApprovalRequest(approvalRequestObjectOrId);
    if ( approvalRequestError ) return approvalRequestError;

    // ensure action is valid
    let action = applicationOptions.approvalStatusActions.find(a => a.value === actionPayload?.action && a.actor === 'submitter');
    if ( !action ) return {error: true, message: 'Invalid action', is400: true};
    if ( !['cancel', 'recall'].includes(actionPayload.action) ) return {error: true, message: 'Invalid action', is400: true};
    const currentStatus = applicationOptions.approvalStatuses.find(s => s.value === approvalRequest.approvalStatus);
    if ( !currentStatus ) return {error: true, message: 'Invalid current status'};
    if ( currentStatus.isFinal ) return {error: true, message: 'Cannot perform action on final status'};
    if ( applicationOptions.getResultingStatus(action.value, approvalRequest) === currentStatus.value ) return {error: true, message: 'Request is already in this status'};

    // do transaction
    const approvalRequestRevisionId = approvalRequest.approvalRequestRevisionId;
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      let data, sql;

      // update approval request status
      data = {
        approval_status: applicationOptions.getResultingStatus(action.value, approvalRequest)
      };
      const updateClause = pg.toUpdateClause(data);
      sql = `
        UPDATE approval_request
        SET ${updateClause.sql}
        WHERE approval_request_revision_id = $${updateClause.values.length + 1}
      `;
      await client.query(sql, [...updateClause.values, approvalRequestRevisionId]);

      // get max approver order
      sql = `SELECT MAX(approver_order) as max_order FROM approval_request_approval_chain_link WHERE approval_request_revision_id = $1`;
      const maxOrderRes = await client.query(sql, [approvalRequestRevisionId]);
      const maxOrder = maxOrderRes.rows[0].max_order || 0;

      // insert submission to approval status activity table
      data = {
        approval_request_revision_id: approvalRequestRevisionId,
        approver_order: maxOrder + 1,
        action: action.value,
        employee_kerberos: approvalRequest.employeeKerberos
      }
      data = pg.prepareObjectForInsert(data);
      sql = `INSERT INTO approval_request_approval_chain_link (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING approval_request_approval_chain_link_id`;
      const chainRes = await client.query(sql, data.values);
      const approvalRequestApprovalChainLinkId = chainRes.rows[0].approval_request_approval_chain_link_id;

      data = {
        approval_request_approval_chain_link_id: approvalRequestApprovalChainLinkId,
        approver_type_id: 4
      }
      data = pg.prepareObjectForInsert(data);
      sql = `INSERT INTO link_approver_type (${data.keysString}) VALUES (${data.placeholdersString})`;
      await client.query(sql, data.values);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      return {error: e};
    } finally {
      client.release();
    }

    return {success: true, approvalRequestId, approvalRequestRevisionId};
  }

  /**
   * @description Update 'approval-needed' status to a new status for an approver
   * @param {Object|Number} approvalRequestObjectOrId - approval request object or approval request ID
   * @param {Object} actionPayload - object with properties:
   * - action {String} - new action status
   * - comments {String} OPTIONAL - comments for the action
   * - fundingSources {Array} OPTIONAL - Array of funding source objects with updated amounts
   * @param {String} approverKerberos - kerberos of the approver
   * @returns {Object} - {success: true} or {error: true}
   */
  async doApproverAction(approvalRequestObjectOrId, actionPayload, approverKerberos){

    // get approval request
    const { approvalRequest, approvalRequestError, approvalRequestId } = await this._getApprovalRequest(approvalRequestObjectOrId);
    if ( approvalRequestError ) return approvalRequestError;

    // ensure approver is next in approval chain
    let isFirstApprover = false;
    let userActionRecord;
    for ( const userAction of approvalRequest.approvalStatusActivity ) {
      if ( userAction.action === 'approval-needed' ) {
        if ( userAction.employeeKerberos === approverKerberos ) {
          userActionRecord = userAction;
          isFirstApprover = true;
        }
        break;
      }
    }
    if ( !isFirstApprover ) return {error: true, message: 'Approver is not authorized to perform this action', is403: true};

    // ensure action is valid
    let action = applicationOptions.approvalStatusActions.find(a => a.value === actionPayload?.action && a.actor === 'approver');
    if ( !action ) return {error: true, message: 'Invalid action', is400: true};

    // verify approve-with-changes has updated funding sources
    // and that total funding sources amount is not different from original
    if ( action.value === 'approve-with-changes') {
      const newFundingSources = Array.isArray(actionPayload.fundingSources) ? actionPayload.fundingSources : [];
      if ( !newFundingSources.length ) return {error: true, message: 'Funding sources required for approve-with-changes', is400: true};

      // convert old and new funding source arrays to key-value objects
      const keyFunc = fs => fs.approvalRequestFundingSourceId;
      const valueFunc = fs => fs.amount;
      const newFundingSourcesObj = typeTransform.arrayToObject(newFundingSources, keyFunc, valueFunc);
      const oldFundingSourcesObj = typeTransform.arrayToObject(approvalRequest.fundingSources, keyFunc, valueFunc);

      // run checks on funding sources
      if ( objectUtils.objectsAreEqual(newFundingSourcesObj, oldFundingSourcesObj) ) {
        action = applicationOptions.approvalStatusActions.find(a => a.value === 'approve');
      } else if ( !objectUtils.objectsHaveSameKeys(newFundingSourcesObj, oldFundingSourcesObj) ) {
        return {error: true, message: 'Funding sources must have the same keys as original', is400: true};
      } else if ( objectUtils.sumObjectValues(newFundingSourcesObj) !== objectUtils.sumObjectValues(oldFundingSourcesObj) ) {
        return {error: true, message: 'Total funding source amount must be the same as original', is400: true};
      }
    }

    // do transaction
    const approvalRequestRevisionId = approvalRequest.approvalRequestRevisionId;
    const approvalRequestApprovalChainLinkId = userActionRecord.approvalRequestApprovalChainLinkId;
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      let data, sql;

      // update funding sources if needed
      let fundChanges = {};
      if ( action.value === 'approve-with-changes' ){
        for (const newFund of actionPayload.fundingSources || []){
          const oldFund = approvalRequest.fundingSources.find(fs => fs.approvalRequestFundingSourceId === newFund.approvalRequestFundingSourceId);
          if (oldFund?.amount !== newFund.amount){
            fundChanges[newFund.approvalRequestFundingSourceId] = {...newFund, oldAmount: oldFund.amount};

            sql = `
              UPDATE approval_request_funding_source
              SET amount = $1
              WHERE approval_request_funding_source_id = $2
            `;
            await client.query(sql, [newFund.amount, newFund.approvalRequestFundingSourceId]);
          }
        }
      }

      // update approval chain record
      data = {
        action: action.value,
        comments: actionPayload.comments || null,
        fund_changes: fundChanges,
        occurred: new Date()
      }
      const updateClause = pg.toUpdateClause(data);
      sql = `
        UPDATE approval_request_approval_chain_link
        SET ${updateClause.sql}
        WHERE approval_request_approval_chain_link_id = $${updateClause.values.length + 1}
      `;
      await client.query(sql, [...updateClause.values, approvalRequestApprovalChainLinkId]);

      // update approval request status
      sql = `
        UPDATE approval_request
        SET approval_status = $1
        WHERE approval_request_revision_id = $2
      `;
      await client.query(sql, [applicationOptions.getResultingStatus(action.value, approvalRequest), approvalRequestRevisionId]);


      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      return {error: e};
    } finally {
      client.release();
    }

    return {success: true, approvalRequestId, approvalRequestRevisionId};

  }


  /**
   * @description Check if argument is an approval request object or ID, fetch object if ID
   * @param {Object|Number} approvalRequest
   * @returns {Object} - {approvalRequestError: Object|Null, approvalRequest: Object, approvalRequestId: Number}
   */
  async _getApprovalRequest(approvalRequest){
    const out = {
      approvalRequestError: false,
      approvalRequest: null,
      approvalRequestId: null
    }

    let approvalRequestId = typeTransform.toPositiveInt(approvalRequest);

    // is id, fetch approval request
    if ( approvalRequestId ){
      approvalRequest = await this.get({requestIds: [approvalRequestId], isCurrent: true});
      if ( approvalRequest.error ) {
        out.approvalRequestError = approvalRequest;
        return out;
      }
      if ( !approvalRequest.total ) {
        out.approvalRequestError = {error: true, message: 'Approval request not found', is400: true};
        return out;
      }
      out.approvalRequest = approvalRequest.data[0];
      out.approvalRequestId = approvalRequestId;

    // we are assuming it is the approval request object
    } else {
      out.approvalRequest = approvalRequest;
      out.approvalRequestId = approvalRequest.approvalRequestId;
    }

    return out;

  }

    /**
   * @description Constructs Values array for INSERT statement given a list of values for hydration
   * @param {Array} values - List of values to sub into insert statement
   * @returns {String} ($1, $2, $3), etc
   */
  valuesArray(values){
    return `(${values.map((v, i) => `$${i + 1}`).join(', ')})`;
  }

  /**
   * @description Converts an object to parameters of a WHERE clause
   * @param {Object} queryObject - key value pairs for clause
   * @param {Boolean} useOr - Use OR instead of AND
   * @returns {Object} {sql: 'foo = $1 AND bar = $2', values: ['fooValue', 'barValue]}
   */
  toWhereClause(queryObject, useOr=false){
    return this._toEqualsClause(queryObject, useOr ? ' OR ' : ' AND ');
  }

  /**
   * @description Converts an object to parameters of a UPDATE clause
   * @param {Object} queryObject - key value pairs for clause
   * @param {Boolean} underscore - Convert keys to underscore
   * @returns {Object} {sql: 'foo = $1, bar = $2', values: ['fooValue', 'barValue]}
   */
  toUpdateClause(queryObject){
    return this._toEqualsClause(queryObject, ', ');
  }

  /**
   * @description Converts an object to parameters of an INSERT clause
   * @param {Object} obj - key value pairs for clause
   * @returns {Object} {keys: ['foo', 'bar'], values: ['fooValue', 'barValue'], placeholders: ['$1', '$2']}
   */
  prepareObjectForInsert(obj){
    const out = {keys: [], values: [], placeholders: []};
    for (const k in obj) {
      out.keys.push(k);
      out.values.push(obj[k]);
      out.placeholders.push(`$${out.values.length}`);
    }

    out.keysString = out.keys.join(', ');
    out.valuesString = out.values.join(', ');
    out.placeholdersString = out.placeholders.join(', ');
    return out;
  }

  _toEqualsClause(queryObject, sep=' AND ', indexStart=0){
    let sql = '';
    const values = [];
    if ( queryObject && typeof queryObject === 'object' ){
      let i = indexStart;
      for (const k of Object.keys(queryObject)) {
        // make an IN clause if the value is an array
        if ( Array.isArray(queryObject[k]) ){
          const inClause = queryObject[k].map((v, j) => `$${i + j + 1}`).join(', ');
          values.push(...queryObject[k]);
          sql += `${i > indexStart ? sep : ''}${k} IN (${inClause})`;
          i += queryObject[k].length;

        // if the value is an object with an operator key, use that operator
        } else if ( queryObject[k] && typeof queryObject[k] === 'object' && queryObject[k].operator && queryObject[k].value !== undefined){
          const operator = queryObject[k].operator;
          const value = queryObject[k].value;
          values.push(value);
          sql += `${i > indexStart ? sep : ''}${k} ${operator} $${i+1}`;
          i++;

        // if the value is an object without a value key, treat it as nested and recurse. check for relation key
        } else if ( queryObject[k] && typeof queryObject[k] === 'object' && queryObject[k].relation !== undefined ){
          const q = {...queryObject[k]};
          const relation = q.relation;
          delete q.relation;
          const nested = this._toEqualsClause(q, relation ? ` ${relation} ` : sep, i);
          values.push(...nested.values);
          sql += `${i > indexStart ? sep : ''}(${nested.sql})`;
          i += nested.values.length;

        // else make an equals clause
        } else {
          values.push(queryObject[k]);
          sql += `${i > indexStart ? sep : ''}${k}=$${i+1}`;
          i++;
        }
      }
    }
    return {sql, values};
  }

}

export default new ApprovalRequest();
