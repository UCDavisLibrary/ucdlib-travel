import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";
import validations from "./approvalRequestValidations.js";
import employeeModel from "./employee.js";
import typeTransform from "../utils/typeTransform.js";

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
        charLimit: 500
      },
      {
        dbName: 'submitted_at',
        jsonName: 'submittedAt',
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
   * - page {Integer} OPTIONAL - page number
   * - pageSize {Integer} OPTIONAL - number of records per page
   */
  async get(kwargs={}){

    // pagination
    const page = Number(kwargs.page) || 1;
    const pageSize = Number(kwargs.pageSize) || 10;
    const noPaging = pageSize === -1;

    // construct where clause conditions for query
    const whereArgs = {};

    if ( Array.isArray(kwargs.revisionIds) && kwargs.revisionIds.length ){
      whereArgs['ar.approval_request_revision_id'] = kwargs.revisionIds;
    }

    if ( Array.isArray(kwargs.requestIds) && kwargs.requestIds.length ){
      whereArgs['ar.approval_request_id'] = kwargs.requestIds;
    }

    if ( kwargs.isCurrent ){
      whereArgs['ar.is_current'] = true;
    } else if ( kwargs.isNotCurrent ){
      whereArgs['ar.is_current'] = false;
    }

    if ( Array.isArray(kwargs.employees) && kwargs.employees.length ){
      whereArgs['ar.employee_kerberos'] = kwargs.employees;
    }
    const whereClause = pg.toWhereClause(whereArgs);

    const countQuery = `
      SELECT
        COUNT(*) as total
      FROM
        approval_request ar
      ${whereClause.sql ? `WHERE ${whereClause.sql}` : ''}
    `;
    const countRes = await pg.query(countQuery, whereClause.values);
    if( countRes.error ) return countRes;
    const total = Number(countRes.res.rows[0].total);

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
    )
    SELECT
      ar.*,
      json_build_object(
        'kerberos', e.kerberos,
        'firstName', e.first_name,
        'lastName', e.last_name
      ) AS employee,
      COALESCE(fs.funding_sources, '[]'::json) AS funding_sources,
      COALESCE(ex.expenditures, '[]'::json) AS expenditures
    FROM
      approval_request ar
    LEFT JOIN
      employee e ON ar.employee_kerberos = e.kerberos
    LEFT JOIN
      funding_sources fs ON ar.approval_request_revision_id = fs.approval_request_revision_id
    LEFT JOIN
      expenditures ex ON ar.approval_request_revision_id = ex.approval_request_revision_id
    ${whereClause.sql ? `WHERE ${whereClause.sql}` : ''}
    ORDER BY
      ar.submitted_at DESC
    ${noPaging ? '' : `LIMIT ${pageSize} OFFSET ${(page-1)*pageSize}`}
    `;

    const res = await pg.query(query, whereClause.values);
    if( res.error ) return res;
    const data = this._prepareResults(res.res.rows);
    const totalPages = noPaging ? 1 : Math.ceil(total / pageSize);
    return {data, total, page, pageSize, totalPages};

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

    // do validation
    if ( forceValidation ) data.forceValidation = true;
    const validation = await this.entityFields.validate(data, ['employee_allocation_id']);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }
    delete data.forceValidation;

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
  async deleteDraft(approvalRequestId, authorizeAgainstKerberos){

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

}

export default new ApprovalRequest();
