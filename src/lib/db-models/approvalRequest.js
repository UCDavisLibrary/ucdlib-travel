import pg from "./pg.js";

import validations from "./approvalRequestValidations.js";
import employeeModel from "./employee.js";
import fundingSourceModel from "./fundingSource.js"
import reimbursementRequestModel from "./reimbursementRequest.js";

import EntityFields from "../utils/EntityFields.js";
import typeTransform from "../utils/typeTransform.js";
import IamEmployeeObjectAccessor from "../utils/iamEmployeeObjectAccessor.js";
import applicationOptions from "../utils/applicationOptions.js";
import objectUtils from "../utils/objectUtils.js";
import emailController from "./emailController.js";
import fiscalYearUtils from "../utils/fiscalYearUtils.js";
import config from '../serverConfig.js';

class ApprovalRequest {

  constructor(){

    this.validations = new validations(this);

    this.entityFields = new EntityFields([
      {
        dbName: 'approval_request_revision_id',
        jsonName: 'approvalRequestRevisionId',
        validateType: 'integer'
      },
      {
        dbName: 'approval_request_id',
        jsonName: 'approvalRequestId',
        validateType: 'integer',
        customValidationAsync: this.validations.approvalRequestId.bind(this.validations)
      },
      {
        dbName: 'is_current',
        jsonName: 'isCurrent',
        validateType: 'boolean'
      },
      {
        dbName: 'approval_status',
        jsonName: 'approvalStatus',
        customValidation: this.validations.approvalStatus.bind(this.validations),
      },
      {
        dbName: 'reimbursement_status',
        jsonName: 'reimbursementStatus',
        required: true,
        customValidation: this.validations.reimbursementStatus.bind(this.validations)
      },
      {
        dbName: 'expect_more_reimbursement',
        jsonName: 'expectMoreReimbursement'
      },
      {
        dbName: 'employee_kerberos',
        jsonName: 'employeeKerberos'
      },
      {
        dbName: 'employee',
        jsonName: 'employee',
        customValidation: this.validations.employee.bind(this.validations)
      },
      {
        dbName: 'label',
        jsonName: 'label',
        charLimit: 100,
        customValidation: this.validations.requireIfNotDraft.bind(this.validations)
      },
      {
        dbName: 'organization',
        jsonName: 'organization',
        charLimit: 100,
        customValidation: this.validations.requireIfNotDraft.bind(this.validations)
      },
      {
        dbName: 'business_purpose',
        jsonName: 'businessPurpose',
        charLimit: 500,
        customValidation: this.validations.requireIfNotDraft.bind(this.validations)
      },
      {
        dbName: 'location',
        jsonName: 'location',
        customValidation: this.validations.location.bind(this.validations)
      },
      {
        dbName: 'location_details',
        jsonName: 'locationDetails',
        charLimit: 100,
        customValidation: this.validations.locationDetails.bind(this.validations)
      },
      {
        dbName: 'program_start_date',
        jsonName: 'programStartDate',
        validateType: 'date',
        customValidation: this.validations.programDate.bind(this.validations)
      },
      {
        dbName: 'program_end_date',
        jsonName: 'programEndDate',
        validateType: 'date',
        customValidation: this.validations.programDate.bind(this.validations)
      },
      {
        dbName: 'release_time',
        jsonName: 'releaseTime',
        validateType: 'integer'
      },
      {
        dbName: 'fiscal_year',
        jsonName: 'fiscalYear'
      },
      {
        dbName: 'travel_required',
        jsonName: 'travelRequired',
        validateType: 'boolean'
      },
      {
        dbName: 'has_custom_travel_dates',
        jsonName: 'hasCustomTravelDates',
        validateType: 'boolean'
      },
      {
        dbName: 'travel_start_date',
        jsonName: 'travelStartDate',
        validateType: 'date',
        customValidation: this.validations.travelDate.bind(this.validations)
      },
      {
        dbName: 'travel_end_date',
        jsonName: 'travelEndDate',
        validateType: 'date',
        customValidation: this.validations.travelDate.bind(this.validations)
      },
      {
        dbName: 'comments',
        jsonName: 'comments',
        charLimit: 2000
      },
      {
        dbName: 'submitted_at',
        jsonName: 'submittedAt',
      },
      {
        dbName: 'department_id',
        jsonName: 'departmentId',
      },
      {
        dbName: 'no_expenditures',
        jsonName: 'noExpenditures',
        validateType: 'boolean'
      },
      {
        dbName: 'expenditures',
        jsonName: 'expenditures',
        validateType: 'array',
        customValidationAsync: this.validations.expenditures.bind(this.validations)
      },
      {
        dbName: 'funding_sources',
        jsonName: 'fundingSources',
        validateType: 'array',
        customValidationAsync: this.validations.fundingSources.bind(this.validations)
      },
      {
        dbName: 'validated_successfully',
        jsonName: 'validatedSuccessfully'
      },
      {
        dbName: 'approval_status_activity',
        jsonName: 'approvalStatusActivity'
      }
    ]);

    this.fundingSourceFields = new EntityFields([
      {
        dbName: 'approval_request_funding_source_id',
        jsonName: 'approvalRequestFundingSourceId'
      },
      {
        dbName: 'approval_request_revision_id',
        jsonName: 'approvalRequestRevisionId'
      },
      {
        dbName: 'funding_source_id',
        jsonName: 'fundingSourceId'
      },
      {
        dbName: 'amount',
        jsonName: 'amount'
      },
      {
        dbName: 'accounting_code',
        jsonName: 'accountingCode'
      },
      {
        dbName: 'description',
        jsonName: 'description'
      }
    ]);

    this.expenditureFields = new EntityFields([
      {
        dbName: 'approval_request_expenditure_id',
        jsonName: 'approvalRequestExpenditureId'
      },
      {
        dbName: 'approval_request_revision_id',
        jsonName: 'approvalRequestRevisionId'
      },
      {
        dbName: 'expenditure_option_id',
        jsonName: 'expenditureOptionId'
      },
      {
        dbName: 'amount',
        jsonName: 'amount'
      }
    ]);
  }

  /**
   * @description Get an array of approval request revisions
   * @param {Object} kwargs - query parameters including:
   * - revisionIds {Array} OPTIONAL - array of approval request revision ids
   * - requestIds {Array} OPTIONAL - array of approval request ids
   * - isCurrent {Boolean} OPTIONAL - whether to get only the current revision
   * - isNotCurrent {Boolean} OPTIONAL - whether to get only revisions that are not current
   * - employees {Array} OPTIONAL - array of employee kerberos
   * - approvalStatus {Array} OPTIONAL - array of approval statuses
   * - approvers {Array} OPTIONAL - array of approver kerberos
   * - page {Integer} OPTIONAL - page number
   * - pageSize {Integer} OPTIONAL - number of records per page
   */
  async get(kwargs={}){

    // pagination
    const page = Number(kwargs.page) || 1;
    const pageSize = Number(kwargs.pageSize) || 10;
    const noPaging = pageSize === -1;

    // construct where clause conditions for query
    let whereArgs = {
      "1" : "1"
    };

    if ( Array.isArray(kwargs.revisionIds) && kwargs.revisionIds.length ){
      whereArgs['ar.approval_request_revision_id'] = kwargs.revisionIds;
    }

    if ( Array.isArray(kwargs.requestIds) && kwargs.requestIds.length ){
      whereArgs['ar.approval_request_id'] = kwargs.requestIds;
    }

    if ( Array.isArray(kwargs.approvalStatus) && kwargs.approvalStatus.length ){
      whereArgs['ar.approval_status'] = kwargs.approvalStatus;
    } else if ( kwargs.excludeDrafts ){
      whereArgs['ar.approval_status'] = {operator: '!=', value: 'draft'};
    }

    if ( Array.isArray(kwargs.reimbursementStatus) && kwargs.reimbursementStatus.length ){
      whereArgs['ar.reimbursement_status'] = kwargs.reimbursementStatus;
    }

    if ( kwargs.programEndDate ){
      whereArgs['ar.program_end_date'] = kwargs.programEndDate;
    }

    if ( kwargs.programStartDate ){
      whereArgs['ar.program_start_date'] = kwargs.programStartDate;
    }

    if ( kwargs.travelEndDate ){
      whereArgs['ar.travel_end_date'] = kwargs.travelEndDate;
    }

    if ( kwargs.travelStartDate ){
      whereArgs['ar.travel_start_date'] = kwargs.travelStartDate;
    }

    if ( kwargs.isCurrent ){
      whereArgs['ar.is_current'] = true;
    } else if ( kwargs.isNotCurrent ){
      whereArgs['ar.is_current'] = false;
    }

    if ( Array.isArray(kwargs.employees) && kwargs.employees.length ){
      whereArgs['ar.employee_kerberos'] = kwargs.employees;
    }

    if ( kwargs.department?.length ){
      whereArgs['ar.department_id'] = kwargs.department;
    }

    if ( kwargs.fiscalYear?.length ){
      whereArgs['ar.fiscal_year'] = kwargs.fiscalYear;
    }

    // some special handling for funding sources,
    // due to nature of query, it's difficult to do standard parameterized query
    let fundingSources = [];
    if ( kwargs.fundingSource?.length ){
      if ( Array.isArray(kwargs.fundingSource) ){
        fundingSources = kwargs.fundingSource;
      } else {
        fundingSources = [kwargs.fundingSource];
      }
      fundingSources = fundingSources.map(fs => Number(fs)).filter(fs => fs);
      if ( fundingSources.length ){
        whereArgs['arfs.funding_source_id'] = fundingSources;
      }
    }

    let approvers = [];
    if ( Array.isArray(kwargs.approvers) && kwargs.approvers.length ){
      approvers = kwargs.approvers;
    }

    // if activeOnly is set, only return approval requests that need approval or reimbursement
    // overrides most other query parameters
    if ( kwargs.activeOnly ) {
      const activeStatus = applicationOptions.approvalStatuses.filter(s => s.isActive).map(s => s.value);
      const reimbursementStatus = applicationOptions.reimbursementStatuses.filter(s => s.isActive).map(s => s.value);
      whereArgs = {
        'ar.is_current': true,
        'statusQuery': {
          relation: 'OR',
          'ar.approval_status': activeStatus,
          'reimbursement_status': {
            relation: 'AND',
            'ar.approval_status': 'approved',
            'ar.reimbursement_status': reimbursementStatus
          }
        }
      }

      if ( !config.featureFlags.reimbursementRequest ){
        delete whereArgs['statusQuery'];
        whereArgs['ar.approval_status'] = activeStatus;
      }

      if ( Array.isArray(kwargs.employees) && kwargs.employees.length ){
        whereArgs['ar.employee_kerberos'] = kwargs.employees;
      }
    }

    let whereClause = pg.toWhereClause(whereArgs);
    let approverActionArray = applicationOptions.approvalStatusActions.filter(s => s.actor === 'approver');
    approverActionArray.push({value: 'approval-needed'});
    approverActionArray = `(${approverActionArray.map(s => `'${s.value}'`).join(',')})`;

    const countQuery = `
      SELECT
        COUNT(DISTINCT ar.approval_request_revision_id) as total
      FROM
        approval_request ar
      LEFT JOIN
        approval_request_approval_chain_link aracl ON ar.approval_request_revision_id = aracl.approval_request_revision_id
      ${fundingSources.length ? `
        LEFT JOIN
          approval_request_funding_source arfs ON ar.approval_request_revision_id = arfs.approval_request_revision_id
        ` : ``}
      WHERE
        ${whereClause.sql}
      ${approvers.length ? `
        AND aracl.employee_kerberos = ANY($${whereClause.values.length + 1})
        AND aracl.action IN ${approverActionArray}
      ` : ''}
    `;
    const countRes = await pg.query(countQuery, approvers.length ? [...whereClause.values, approvers] : whereClause.values);
    if( countRes.error ) return countRes;
    const total = Number(countRes.res.rows[0].total);

    if ( kwargs.fundingSource?.length ){
      delete whereArgs['arfs.funding_source_id'];
    }
    whereClause = pg.toWhereClause(whereArgs);

    const query = `
    WITH funding_sources AS (
      SELECT
        arfs.approval_request_revision_id,
        json_agg(
          json_build_object(
            'approvalRequestFundingSourceId', arfs.approval_request_funding_source_id,
            'fundingSourceId', arfs.funding_source_id,
            'fundingSourceLabel', fs.label,
            'amount', arfs.amount,
            'accountingCode', arfs.accounting_code,
            'description', arfs.description
          )
        ) AS funding_sources
      FROM
        approval_request_funding_source arfs
      LEFT JOIN
        funding_source fs ON arfs.funding_source_id = fs.funding_source_id
      ${fundingSources.length ? `
        WHERE
          arfs.funding_source_id IN (${fundingSources.join(',')})
        ` : ``}
      GROUP BY
        arfs.approval_request_revision_id
    ),
    expenditures AS (
      SELECT
        are.approval_request_revision_id,
        json_agg(
          json_build_object(
            'approvalRequestExpenditureId', are.approval_request_expenditure_id,
            'expenditureOptionId', are.expenditure_option_id,
            'expenditureOptionLabel', eo.label,
            'amount', are.amount
          )
        ) AS expenditures
      FROM
        approval_request_expenditure are
      LEFT JOIN
        expenditure_option eo ON are.expenditure_option_id = eo.expenditure_option_id
      GROUP BY
        are.approval_request_revision_id
    ),
    approval_status_activity AS (
      SELECT
        aracl.approval_request_revision_id,
        json_agg(
          json_build_object(
            'approvalRequestApprovalChainLinkId', aracl.approval_request_approval_chain_link_id,
            'approverOrder', aracl.approver_order,
            'action', aracl.action,
            'employeeKerberos', aracl.employee_kerberos,
            'employee', json_build_object(
              'kerberos', e.kerberos,
              'firstName', e.first_name,
              'lastName', e.last_name
            ),
            'comments', aracl.comments,
            'fundChanges', aracl.fund_changes,
            'occurred', aracl.occurred,
            'reimbursementRequestId', aracl.reimbursement_request_id,
            'notificationId', aracl.notification_id,
            'approverTypes', COALESCE(
              (SELECT json_agg(json_build_object(
                  'approverTypeId', at.approver_type_id,
                  'approverTypeLabel', at.label
                ))
               FROM
                link_approver_type lat
               JOIN
                approver_type at ON lat.approver_type_id = at.approver_type_id
               WHERE
                lat.approval_request_approval_chain_link_id = aracl.approval_request_approval_chain_link_id),
              '[]'::json)
          )
          ORDER BY aracl.approver_order
        ) AS approval_status_activity
      FROM
        approval_request_approval_chain_link aracl
      LEFT JOIN
        employee e ON aracl.employee_kerberos = e.kerberos
      GROUP BY
        aracl.approval_request_revision_id
    )
    SELECT
      ar.*,
      json_build_object(
        'kerberos', e.kerberos,
        'firstName', e.first_name,
        'lastName', e.last_name
      ) AS employee,
      COALESCE(fs.funding_sources, '[]'::json) AS funding_sources,
      COALESCE(ex.expenditures, '[]'::json) AS expenditures,
      COALESCE(asa.approval_status_activity, '[]'::json) AS approval_status_activity
    FROM
      approval_request ar
    LEFT JOIN
      employee e ON ar.employee_kerberos = e.kerberos
    LEFT JOIN
      funding_sources fs ON ar.approval_request_revision_id = fs.approval_request_revision_id
    LEFT JOIN
      expenditures ex ON ar.approval_request_revision_id = ex.approval_request_revision_id
    LEFT JOIN
      approval_status_activity asa ON ar.approval_request_revision_id = asa.approval_request_revision_id
    WHERE ${whereClause.sql}
    ${fundingSources.length ? `
      AND fs.funding_sources IS NOT NULL
      ` : ``}
    ${approvers.length ? `
      AND EXISTS (
        SELECT 1
        FROM
          json_array_elements(asa.approval_status_activity) AS activity
        WHERE
          (activity->>'employeeKerberos')::text = ANY($${whereClause.values.length + 1}) AND
          (activity->>'action')::text IN ${approverActionArray}
      )
    ` : ''}
    ORDER BY
      ar.submitted_at DESC
    ${noPaging ? '' : `LIMIT ${pageSize} OFFSET ${(page-1)*pageSize}`}
    `;

    const res = await pg.query(query, approvers.length ? [...whereClause.values, approvers] : whereClause.values);
    if( res.error ) return res;
    const data = this._prepareResults(res.res.rows);
    const totalPages = noPaging ? 1 : Math.ceil(total / pageSize);
    return {data, total, page, pageSize, totalPages};

  }

  /**
   * @description Get count for each unique value of an approval request field
   * @param {String} field - the field to get counts for
   * @param {Object} kwargs - optional query parameters including
   * @param {Boolean} kwargs.isCurrent - whether to get only current revisions
   * @param {Boolean} kwargs.isNotCurrent - whether to get only revisions that are not current
   * @param {Array} kwargs.employees - array of kerberos ids representing approval request submitters
   * @param {Array} kwargs.approvalStatus - array of approval statuses
   * @param {Boolean} kwargs.excludeDrafts - whether to exclude drafts from the count
   * @param {Array} kwargs.approvers - array of kerberos ids representing approvers
   * @returns
   */
  async getFieldCounts(field, kwargs) {
    const whereArgs = {"1" : "1"};

    if ( kwargs.isCurrent ){
      whereArgs['ar.is_current'] = true;
    } else if ( kwargs.isNotCurrent ){
      whereArgs['ar.is_current'] = false;
    }

    if ( Array.isArray(kwargs.employees) && kwargs.employees.length ){
      whereArgs['ar.employee_kerberos'] = kwargs.employees;
    }

    if ( Array.isArray(kwargs.approvalStatus) && kwargs.approvalStatus.length ){
      whereArgs['ar.approval_status'] = kwargs.approvalStatus;
    } else if ( kwargs.excludeDrafts ){
      whereArgs['ar.approval_status'] = {operator: '!=', value: 'draft'};
    }

    if ( Array.isArray(kwargs.approvers) && kwargs.approvers.length ){
      whereArgs['approvers'] = {
        relation: 'AND',
        'aracl.employee_kerberos': kwargs.approvers,
        'aracl.action': ['approval-needed', ...applicationOptions.approvalStatusActions.filter(s => s.actor === 'approver').map(s => s.value)]
      }
    }

    if ( !field.includes('.') ){
      field = `ar.${field}`;
    }

    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT
        ${field},
        COUNT(DISTINCT ar.approval_request_revision_id) as count
      FROM
        approval_request ar
      LEFT JOIN
        approval_request_approval_chain_link aracl ON ar.approval_request_revision_id = aracl.approval_request_revision_id
      WHERE
        ${whereClause.sql}
      GROUP BY
        ${field}
      ORDER BY
        count DESC
    `;

    const res = await pg.query(sql, whereClause.values);
    if ( res.error ) return res;
    return res.res.rows;
  }

  /**
   * @description Prepare array of approval request revision objects for return
   * @param {Array} results - array of approval request revision objects
   * @returns {Array}
   */
  _prepareResults(results){
    results = this.entityFields.toJsonArray(results);
    for (const result of results){

      // ensure array fields are arrays
      const arrayFields = ['fundingSources', 'expenditures'];
      for (const field of arrayFields){
        if ( !result[field] ){
          result[field] = [];
        }
      }

      // ensure date fields are YYYY-MM-DD
      const dateFields = ['programStartDate', 'programEndDate', 'travelStartDate', 'travelEndDate'];
      for (const field of dateFields){
        if ( result[field] ){
          result[field] = result[field].toISOString().split('T')[0];
        }
      }
    }
    return results;
  }

  /**
   * @description Create a new approval request revision
   * @param {Object} data - the approval request revision data - see entityFields for expected fields (json names)
   * @param {Object} submittedBy - the employee object of the employee submitting the request
   *  - if data.employeeKerberos is not set, this object will be used to set the employeeKerberos field
   * @param {Boolean} forceValidation - whether to force validation even if not required (aka for a draft revision)
   * @returns {Object}
   */
  async createRevision(data, submittedBy, forceValidation){
    // if submittedBy is provided, assign approval request revision to that employee
    if ( submittedBy ){
      data.employee = submittedBy;
      delete data.employeeKerberos;
    }

    data = this.entityFields.toDbObj(data);

    // remove system generated fields
    delete data.approval_request_revision_id;
    delete data.is_current;
    delete data.submitted_at
    delete data.approval_status_activity;
    delete data.department_id;

    // do validation
    data.validated_successfully = false;
    if ( forceValidation ) data.forceValidation = true;
    const validation = await this.entityFields.validate(data, ['employee_allocation_id']);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }
    if ( data.forceValidation || data.approval_status !== 'draft' ){
      data.validated_successfully = true;
    }
    delete data.forceValidation;

    // extract employee object from data
    const employee = data.employee_kerberos ? {kerberos: data.employee.kerberos} : data.employee;
    data.employee_kerberos = data.employee_kerberos || data.employee.kerberos;
    if ( data?.employee?.department?.departmentId ) {
      data.department_id = data.employee.department.departmentId;
    }
    delete data.employee;

    // set funding source to "No funding/program time only" if no expenditures
    // required to determine approval chain (still need supervisor approval)
    if ( data.no_expenditures ){
      data.funding_sources = [{fundingSourceId: 8, amount: 0}];
      data.expenditures = [];
    }

    if ( data.program_start_date ){
      data.fiscal_year = fiscalYearUtils.fromDate(data.program_start_date).startYear;
    }

    // prep data for transaction
    let out = {};
    let approvalRequestRevisionId;
    const fundingSources = (data.funding_sources || []).filter(fs => fs.amount || fs.fundingSourceId);
    delete data.funding_sources;
    const expenditures = data.expenditures || [];
    delete data.expenditures;

    // start transaction
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      // upsert employee and department
      await employeeModel.upsertInTransaction(client, employee);

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
      client.release();
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
   * @description Deletes an approval request (and all its revisions)
   * Approval request must has only ever been in draft status
   * @param {Number} approvalRequestId
   * @param {String} authorizeAgainstKerberos - kerberos of user authorizing deletion
   * if included, will be used to check if user is approval request owner
   * @returns {Object} - {success: true} or {error: true||errorobject, message: 'error message'}
   */
  async deleteDraft(approvalRequestId, authorizeAgainstKerberos, cancelIfNotDraft){

    // cast to positive integer, return 400 if invalid
    approvalRequestId = typeTransform.toPositiveInt(approvalRequestId);
    if ( !approvalRequestId ) return {error: true, message: 'Invalid approval request id', is400: true};

    // check if approval request exists
    const existingRecords = await this.get({requestIds: [approvalRequestId]});
    if ( existingRecords.error ) return existingRecords;
    if ( !existingRecords.total ) return {error: true, message: 'Approval request not found', is400: true};

    // check if user is authorized to delete
    if ( authorizeAgainstKerberos ){
      const currentRecord = existingRecords.data.find(r => r.isCurrent);
      if ( !currentRecord ) return {error: true, message: 'Approval request not found', is400: true};
      if ( currentRecord.employeeKerberos !== authorizeAgainstKerberos ) return {error: true, message: 'Forbidden', is403: true};
    }

    // check if any records are not in draft status
    const hasNonDraft = existingRecords.data.some(r => r.approvalStatus !== 'draft');

    // try to cancel request
    if ( hasNonDraft && cancelIfNotDraft ){
      const r = this.doRequesterAction(approvalRequestId, {action: 'cancel'});
      if ( r.error ) return r;
      return {success: true, approvalRequestId};
    }

    if ( hasNonDraft ) return {error: true, message: 'Cannot delete approval request with non-draft status', is400: true};

    const revisionIds = existingRecords.data.map(r => r.approvalRequestRevisionId);

    // do transaction
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      let sql = `DELETE FROM approval_request_expenditure WHERE approval_request_revision_id = ANY($1)`;
      await client.query(sql, [revisionIds]);

      sql = `DELETE FROM approval_request_funding_source WHERE approval_request_revision_id = ANY($1)`;
      await client.query(sql, [revisionIds]);

      sql = `DELETE FROM approval_request WHERE approval_request_id = $1`;
      await client.query(sql, [approvalRequestId]);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      return {error: e};
    } finally {
      client.release();
    }

    return {success: true, approvalRequestId};
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

            let isUniversityLibrarian = false;
            if((submitter?.groups || []).find(g => g.id == 1 && g.partOfOrg && g.isHead)){
              isUniversityLibrarian = true;
            }


            if ( !isUniversityLibrarian && !submitter?.supervisor?.iamId ) {
              return {error: true, message: 'Submitter supervisor not found'};
            }

            approvers.push({
              approvalTypeOrder: ap.approvalOrder,
              employeeOrder: 0,
              approverTypeLabel: ap.label,
              approverTypeId: ap.approverTypeId,
              employeeId: isUniversityLibrarian ? submitter.iam_id : submitter.supervisor.iamId,
              employeeIdType: 'iam-id'
            });

          // submitter department head
          } else if ( ap.approverTypeId == 2 ){

            let isDepartmentHead = false;
            if((submitter?.groups || []).find(g => g.partOfOrg && g.isHead)){
              isDepartmentHead = true;
            }

            // bail if submitter has no department head and is not department head
            if ( !isDepartmentHead && !submitter?.departmentHead?.iamId && !(submitter?.groups || []).find(g => g.partOfOrg && g.isHead) ) {
              return {error: true, message: 'Submitter department head not found'};
            }

            approvers.push({
              approvalTypeOrder: ap.approvalOrder,
              employeeOrder: 0,
              approverTypeLabel: ap.label,
              approverTypeId: ap.approverTypeId,
              employeeId: isDepartmentHead ? submitter.iam_id : submitter.departmentHead.iamId,
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
   * @description add the notification to the notification table
   * @param {Number} approvalRequestRevisionId - approval request ID
   * @param {String} kerb - kerberos
   * @param {String} action - action object
   * @returns
   */
  async addNotification(approvalRequestRevisionId, kerb, action){
    // get max approver order
    let sql = `SELECT MAX(approver_order) as max_order FROM approval_request_approval_chain_link WHERE approval_request_revision_id = $1`;
    const maxOrderResApprover = await pg.query(sql, [approvalRequestRevisionId]);
    const maxOrderApprover = maxOrderResApprover.res.rows[0].max_order || 0;


    // insert submission to approval status activity table
    let notification = {
      approval_request_revision_id: approvalRequestRevisionId,
      approver_order: maxOrderApprover + 1,
      action: action,
      employee_kerberos: kerb
    }
    notification = pg.prepareObjectForInsert(notification);
    sql = `INSERT INTO approval_request_approval_chain_link (${notification.keysString}) VALUES (${notification.placeholdersString}) RETURNING approval_request_approval_chain_link_id`;
    await pg.query(sql, notification.values);
  }

  /**
   * @description Submit an existing approval request draft for approval
   * @param {Object|Number} approvalRequestObjectOrId - approval request object or approval request ID
   * @returns {Object} - {success: true} or {error: true}
   */
  async submitDraft(approvalRequestObjectOrId){
    const { approvalRequest, approvalRequestError, approvalRequestId } = await this._getApprovalRequest(approvalRequestObjectOrId);
    let modifiedApprovalRequest = approvalRequest;
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

      let isApprover = false;

      // insert approval chain links
      for (const [index, approver] of approvalChain.entries()){

        // upsert employee and department
        const employee = new IamEmployeeObjectAccessor(approver.employee)
        await employeeModel.upsertInTransaction(client, employee.travelAppObject);

        if(employee.kerberos == approvalRequest.employeeKerberos) isApprover = true;

        // insert into approval chain table
        data = {
          approval_request_revision_id: approvalRequestRevisionId,
          approver_order: index,
          action:  isApprover ? 'approve': 'approval-needed',
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

      let apStatus = 'in-progress';
      if(isApprover && approvalChain.length == 1){
        apStatus = 'approved';
      }
      else if(!isApprover){
        apStatus = 'submitted';
      }
      else {
        apStatus = 'in-progress';
      }

      // update approval request status to 'submitted'
      data = {
        approval_status: apStatus,
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

    // do system notifications and add them to approval request activity table
    // if they fail, log the error but don't prevent the request from being submitted
    const out = {success: true, approvalRequestId, approvalRequestRevisionId};
    const notificationErrorMessage = 'Error sending system notifications for approval request submission';

    modifiedApprovalRequest = await this.get({revisionIds: [approvalRequestRevisionId]});
    if ( modifiedApprovalRequest.error ) {
      console.error(notificationErrorMessage, modifiedApprovalRequest);
      return out;
    }
    modifiedApprovalRequest = modifiedApprovalRequest.data[0];

    let approverEmployee = modifiedApprovalRequest.approvalStatusActivity.filter((o) => o.action == 'approval-needed');

    if(approverEmployee.length === 0){
      return out;
    }

    // email the requester
    let tokenRequest = {preferred_username: modifiedApprovalRequest.employeeKerberos}
    const payloadRequest = {
      requests: {
        approvalRequest: modifiedApprovalRequest,
        reimbursementRequest: {},
      },
      token: tokenRequest,
      notificationType: 'request'
    }
    const requesterEmailSent = await emailController.sendSystemNotification(
      payloadRequest.notificationType,
      payloadRequest.requests.approvalRequest,
      payloadRequest.requests.reimbursementRequest,
      payloadRequest);

    if ( requesterEmailSent ){
      await this.addNotification(approvalRequestRevisionId, modifiedApprovalRequest.employeeKerberos, "request-notification");
    }

    // Email first approver
    approverEmployee = modifiedApprovalRequest.approvalStatusActivity.filter((o) => o.action == 'approval-needed');
    let tokenApprover = {preferred_username: approverEmployee[0].employeeKerberos}
    const payloadNextApprover = {
      requests: {
        approvalRequest: modifiedApprovalRequest,
        reimbursementRequest: {},
      },
      token: tokenApprover,
      notificationType: 'next-approver'
    }
    const approverEmailSent = await emailController.sendSystemNotification(
      payloadNextApprover.notificationType,
      payloadNextApprover.requests.approvalRequest,
      payloadNextApprover.requests.reimbursementRequest,
      payloadNextApprover
    );
    if ( approverEmailSent ){
      await this.addNotification(approvalRequestRevisionId, approverEmployee[0].employeeKerberos, "approver-notification");
    }
    return out;
  }

  /**
   * @description Update requester status to a new status for an requester
   * @param {Object|Number} approvalRequestObjectOrId - approval request object or approval request ID
   * @param {Object} actionPayload - object with properties:
   * - action {String} - new action status
   * - comments {String} OPTIONAL - comments for the action
   * - fundingSources {Array} OPTIONAL - Array of funding source objects with updated amounts
   * @returns {Object} - {success: true} or {error: true}
   */
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
    let notification;

    // get approval request
    const { approvalRequest, approvalRequestError, approvalRequestId } = await this._getApprovalRequest(approvalRequestObjectOrId);
    let modifiedApprovalRequest = approvalRequest;
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

    // do system notifications and add them to approval request activity table
    // if they fail, log the error but don't prevent the request from being submitted
    const out = {success: true, approvalRequestId, approvalRequestRevisionId};
    const notificationErrorMessage = 'Error sending system notifications for approval request approver action';

    modifiedApprovalRequest = await this.get({revisionIds: [approvalRequestRevisionId]});
    if ( modifiedApprovalRequest.error ) {
      console.error(notificationErrorMessage, modifiedApprovalRequest);
      return out;
    }
    modifiedApprovalRequest = modifiedApprovalRequest.data[0];

    let aKerberos = modifiedApprovalRequest.approvalStatusActivity.filter(
      a => a.action === 'approve' ||
      a.action === 'approve-with-changes' ||
      a.action === 'deny' ||
      a.action === 'request-revision' ||
      a.action === 'approval-needed'
    );
    let lastApprover = aKerberos.pop();

    let token = {preferred_username: approverKerberos}


    const payloadApprover = {
      "requests": {
        approvalRequest: modifiedApprovalRequest,
        reimbursementRequest: {},
      },
      token: token,
    }

    // approval notification
    if(action.value == 'approve' || action.value == 'approve-with-changes'){
      let notified;
      let notificationKerberos;
      if(lastApprover.employeeKerberos === approverKerberos){
        notified = "request-notification";
        notification = 'chain-completed';
        notificationKerberos = modifiedApprovalRequest.employeeKerberos;
      } else {
        notified = "approver-notification";
        notification = 'next-approver';
        notificationKerberos = applicationOptions.getNextApprover(modifiedApprovalRequest, true);
      }
      payloadApprover.token = {preferred_username: notificationKerberos};

      payloadApprover.notificationType = notification;
      const approvalNotificationSent = await emailController.sendSystemNotification( payloadApprover.notificationType,
        payloadApprover.requests.approvalRequest,
        payloadApprover.requests.reimbursementRequest,
        payloadApprover
      );
      if ( approvalNotificationSent ){
        await this.addNotification(approvalRequestRevisionId, notificationKerberos, notified);
      }
    }

    // deny or request revision notification
    if (action.value == 'deny' || action.value == 'request-revision') {
      notification = 'approver-change';
      payloadApprover.notificationType = notification;
      payloadApprover.token = {preferred_username: modifiedApprovalRequest.employeeKerberos};
      const deniedNotificationSent = await emailController.sendSystemNotification( payloadApprover.notificationType,
        payloadApprover.requests.approvalRequest,
        payloadApprover.requests.reimbursementRequest,
        payloadApprover
      );
      if ( deniedNotificationSent ){
        await this.addNotification(approvalRequestRevisionId, modifiedApprovalRequest.employeeKerberos, "request-notification");
      }
    }

    return out;

  }

  /**
   * @description Get total approval request expenditures grouped by funding source and employee
   * @param {Object} query - optional query object with properties:
   * - fiscalYear {String} - fiscal year string (YYYY)
   * - employees {Array} - array of employee kerberos
   * - excludeReimbursed {Boolean} - exclude approval requests that have been fully reimbursed
   * - approvalStatus {String} - approval status to filter by
   * @returns {Object} - {error: true, message: 'error message'} or array of objects with properties:
   * - employeeKerberos {String} - kerberos of employee
   * - fundingSourceId {Number} - funding source ID
   * - totalExpenditures {Number} - total expenditures for employee and funding source
   */
  async getTotalFundingSourceExpendituresByEmployee(query={}){

    const whereArgs = {
      'ar.is_current': true
    };

    if ( query.employees ){
      whereArgs['ar.employee_kerberos'] = query.employees;
    }

    const fiscalYear = fiscalYearUtils.fromStartYear(query.fiscalYear, true);
    if ( fiscalYear ){
      whereArgs['fy_start'] = {relation: 'AND', 'ar.program_start_date' : {operator: '>=', value: fiscalYear.startDate({isoDate: true})}};
      whereArgs['fy_end'] = {relation: 'AND', 'ar.program_start_date' : {operator: '<=', value: fiscalYear.endDate({isoDate: true})}};
    }

    if ( query.excludeReimbursed ){
      whereArgs['ar.reimbursement_status'] = {operator: '!=', value: 'fully-reimbursed'};
    }

    if ( query.approvalStatus ){
      whereArgs['ar.approval_status'] = query.approvalStatus;
    }

    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT
        ar.employee_kerberos,
        arfs.funding_source_id,
        SUM(arfs.amount) AS total_expenditures
      FROM
        approval_request ar
      JOIN
        approval_request_funding_source arfs ON ar.approval_request_revision_id = arfs.approval_request_revision_id
      WHERE
        ${whereClause.sql}
      GROUP BY
        ar.employee_kerberos, arfs.funding_source_id
    `

    const res = await pg.query(sql, whereClause.values);
    if ( res.error ) return res;

    const fields = new EntityFields([
      {dbName: 'employee_kerberos', jsonName: 'employeeKerberos'},
      {dbName: 'funding_source_id', jsonName: 'fundingSourceId'},
      {dbName: 'total_expenditures', jsonName: 'totalExpenditures'}
    ]);

    return fields.toJsonArray(res.res.rows).map(r => {
      r.totalExpenditures = Number(r.totalExpenditures);
      return r;
    });

  }

  /**
   * @description Toggle the more reimbursement flag on an approval request, and possibly update its overall reimbursement status
   * @param {*} approvalRequestObjectOrId - approval request object or ID
   * @returns
   */
  async toggleMoreReimbursement(approvalRequestObjectOrId){
    const { approvalRequest, approvalRequestError, approvalRequestId } = await this._getApprovalRequest(approvalRequestObjectOrId);
    if ( approvalRequestError ) return approvalRequestError;

    const approvalRequestRevisionId = approvalRequest.approvalRequestRevisionId;
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      let data, sql;

      // update approval request status
      data = {
        expect_more_reimbursement: !approvalRequest.expectMoreReimbursement
      };
      const updateClause = pg.toUpdateClause(data);
      sql = `
        UPDATE approval_request
        SET ${updateClause.sql}
        WHERE approval_request_revision_id = $${updateClause.values.length + 1}
      `;

      await client.query(sql, [...updateClause.values, approvalRequestRevisionId]);
      await reimbursementRequestModel._updateApprovalRequestReimbursementStatus(client, null, approvalRequestId);

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

}

export default new ApprovalRequest();
