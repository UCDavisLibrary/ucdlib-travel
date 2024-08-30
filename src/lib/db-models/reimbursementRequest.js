import pg from "./pg.js";

import validations from "./reimbursementRequestValidations.js";
import FundTransactionValidations from "./fundTransactionValidations.js";
import EntityFields from "../utils/EntityFields.js";
import objectUtils from "../utils/objectUtils.js";
import employeeModel from "./employee.js";
import typeTransform from "../utils/typeTransform.js";
import fiscalYearUtils from "../utils/fiscalYearUtils.js";

class ReimbursementRequest {
  constructor(){

    this.validations = new validations(this);
    this.fundTransactionValidations = new FundTransactionValidations(this);

    this.entityFields = new EntityFields([
      {
        dbName: 'reimbursement_request_id',
        jsonName: 'reimbursementRequestId',
        validateType: 'integer'
      },
      {
        dbName: 'approval_request_id',
        jsonName: 'approvalRequestId',
        customValidationAsync: this.validations.approvalRequestId.bind(this.validations)
      },
      {
        dbName: 'label',
        jsonName: 'label',
        charLimit: 100
      },
      {
        dbName: 'employee_residence',
        jsonName: 'employeeResidence',
        charLimit: 100
      },
      {
        dbName: 'travel_start',
        jsonName: 'travelStart',
        customValidation: this.validations.travelDates.bind(this.validations)
      },
      {
        dbName: 'travel_end',
        jsonName: 'travelEnd',
        customValidation: this.validations.travelDates.bind(this.validations)
      },
      {
        dbName: 'personal_time',
        jsonName: 'personalTime',
        charLimit: 500
      },
      {
        dbName: 'comments',
        jsonName: 'comments',
        charLimit: 500
      },
      {
        dbName: 'status',
        jsonName: 'status',
        customValidation: this.validations.status.bind(this.validations)
      },
      {
        dbName: 'submitted_at',
        jsonName: 'submittedAt'
      },
      {
        dbName: 'expenses',
        jsonName: 'expenses',
        customValidationAsync: this.validations.expenses.bind(this.validations)
      },
      {
        dbName: 'receipts',
        jsonName: 'receipts',
        customValidationAsync: this.validations.receipts.bind(this.validations)
      }
    ]);

    this.expenseFields = new EntityFields([
      {
        dbName: 'reimbursement_request_expense_id',
        jsonName: 'reimbursementRequestExpenseId',
        validateType: 'integer',
      },
      {
        dbName: 'reimbursement_request_id',
        jsonName: 'reimbursementRequestId',
        jsonBuildObjectOptions: {exclude: true}
      },
      {
        dbName: 'amount',
        jsonName: 'amount',
        customValidationAsync: this.validations.expenseAmount.bind(this.validations)
      },
      {
        dbName: 'category',
        jsonName: 'category',
      },
      {
        dbName: 'date',
        jsonName: 'date',
        customValidationAsync: this.validations.expenseDate.bind(this.validations)
      },
      {
        dbName: 'notes',
        jsonName: 'notes',
        charLimit: 500
      },
      {
        dbName: 'details',
        jsonName: 'details',
        customValidationAsync: this.validations.expenseDetails.bind(this.validations)
      }
    ],
    {jsonBuildObjectTable: 're'}
    );

    this.receiptFields = new EntityFields([
      {
        dbName: 'reimbursement_request_receipt_id',
        jsonName: 'reimbursementRequestReceiptId',
        validateType: 'integer'
      },
      {
        dbName: 'reimbursement_request_id',
        jsonName: 'reimbursementRequestId',
        validateType: 'integer'
      },
      {
        dbName: 'file_path',
        jsonName: 'filePath',
        required: true,
        label: 'File'
      },
      {
        dbName: 'file_type',
        jsonName: 'fileType'
      },
      {
        dbName: 'label',
        jsonName: 'label',
        label: 'Receipt Label',
        required: true,
        charLimit: 200
      },
      {
        dbName: 'description',
        jsonName: 'description',
        label: 'Receipt Description',
        charLimit: 500
      },
      {
        dbName: 'uploaded_by',
        jsonName: 'uploadedBy'
      },
      {
        dbName: 'uploaded_at',
        jsonName: 'uploadedAt'
      },
      {
        dbName: 'deleted',
        jsonName: 'deleted'
      },
      {
        dbName: 'deleted_by',
        jsonName: 'deletedBy'
      },
      {
        dbName: 'deleted_at',
        jsonName: 'deletedAt'
      }
    ], {jsonBuildObjectTable: 'rrr'});

    this.fundTransactionFields = new EntityFields([
      {
        dbName: 'reimbursement_request_fund_id',
        jsonName: 'reimbursementRequestFundId',
        customValidationAsync: this.fundTransactionValidations.reimbursementRequestFundId.bind(this.fundTransactionValidations)
      },
      {
        dbName: 'reimbursement_request_id',
        jsonName: 'reimbursementRequestId',
        customValidationAsync: this.fundTransactionValidations.reimbursementRequestId.bind(this.fundTransactionValidations)
      },
      {
        dbName: 'approval_request_funding_source_id',
        jsonName: 'approvalRequestFundingSourceId',
        customValidationAsync: this.fundTransactionValidations.approvalRequestFundingSourceId.bind(this.fundTransactionValidations)
      },
      {
        dbName: 'funding_source_id',
        jsonName: 'fundingSourceId'
      },
      {
        dbName: 'funding_source_label',
        jsonName: 'fundingSourceLabel'
      },
      {
        dbName: 'amount',
        jsonName: 'amount',
        customValidation: this.fundTransactionValidations.amount.bind(this.fundTransactionValidations)
      },
      {
        dbName: 'accounting_code',
        jsonName: 'accountingCode',
        charLimit: 200
      },
      {
        dbName: 'reimbursement_status',
        jsonName: 'reimbursementStatus',
        customValidation: this.fundTransactionValidations.reimbursementStatus.bind(this.fundTransactionValidations)
      },
      {
        dbName: 'added_by',
        jsonName: 'addedBy'
      },
      {
        dbName: 'added_at',
        jsonName: 'addedAt'
      },
      {
        dbName: 'modified_by',
        jsonName: 'modifiedBy'
      },
      {
        dbName: 'modified_at',
        jsonName: 'modifiedAt'
      }
    ]);
  }

  /**
   * @description Get reimbursement requests
   * @param {Object} query - query object with the following properties:
   * - approvalRequestIds: Array of approval request ids
   * - reimbursementRequestIds: Array of reimbursement request ids
   * - page: Number - page number
   * - pageSize: Number - number of items per page
   * @returns {Object} - if successful, returns an object with the following properties:
   *  - data: Array of reimbursement request objects
   *  - total: Number - total number of reimbursement requests
   *  - page: Number - current page number
   *  - pageSize: Number - number of items per page
   *  - totalPages: Number - total number of pages
   * - if unsuccessful, returns an object with an error property
   */
  async get(query={}){

    // pagination
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const noPaging = pageSize === -1;

    // construct where clause conditions for query
    let whereArgs = {
      "1" : "1"
    };

    if ( Array.isArray(query.approvalRequestIds) && query.approvalRequestIds.length ) {
      whereArgs["rr.approval_request_id"] = query.approvalRequestIds;
    }

    if ( Array.isArray(query.reimbursementRequestIds) && query.reimbursementRequestIds.length ) {
      whereArgs["rr.reimbursement_request_id"] = query.reimbursementRequestIds;
    }

    if ( Array.isArray(query.status) && query.status.length ) {
      whereArgs["rr.status"] = query.status;
    }
    const whereClause = pg.toWhereClause(whereArgs);

    // get total count
    const countSql = `
      SELECT
        COUNT(rr.reimbursement_request_id) as total
      FROM
        reimbursement_request rr
      WHERE
        ${whereClause.sql}
    `;
    const countRes = await pg.query(countSql, whereClause.values);
    if( countRes.error ) return countRes;
    const total = Number(countRes.res.rows[0].total);

    // get data
    const sql = `
      SELECT
        rr.*,
        json_agg(${this.expenseFields.jsonBuildObject()}) as expenses,
        json_agg(${this.receiptFields.jsonBuildObject()}) as receipts
      FROM
        reimbursement_request rr
      LEFT JOIN
        reimbursement_request_expense re ON rr.reimbursement_request_id = re.reimbursement_request_id
      LEFT JOIN
        reimbursement_request_receipt rrr ON rr.reimbursement_request_id = rrr.reimbursement_request_id
      WHERE
        ${whereClause.sql}
      GROUP BY
        rr.reimbursement_request_id
      ORDER BY
        rr.reimbursement_request_id DESC
      ${noPaging ? '' : `LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`}
    `;

    const res = await pg.query(sql, whereClause.values);
    if( res.error ) return res;

    const data = this.entityFields.toJsonArray(res.res.rows);
    for ( const row of data ){
      if ( !row.expenses?.[0]?.reimbursementRequestExpenseId ) row.expenses = [];
      if ( !row.receipts?.[0]?.reimbursementRequestReceiptId ) row.receipts = [];

      row.expenses = objectUtils.uniqueArray(row.expenses, 'reimbursementRequestExpenseId');
      row.receipts = objectUtils.uniqueArray(row.receipts, 'reimbursementRequestReceiptId');
    }
    const totalPages = noPaging ? 1 : Math.ceil(total / pageSize);

    return {data, total, page, pageSize, totalPages};

  }

  /**
   * @description Create a reimbursement request
   * @param {Object} data - reimbursement request data. See this.entityFields for field names
   * @returns {Object} - returns an object with the following properties:
   *  - success: Boolean - true if successful
   *  - reimbursementRequestId: Number - the id of the new reimbursement request
   *  - error: Boolean - true if an error occurred
   */
  async create(data){

    data = this.entityFields.toDbObj(data);
    data.expenses = this.expenseFields.toDbArray(Array.isArray(data.expenses) ?  data.expenses : []);
    data.receipts = this.receiptFields.toDbArray(Array.isArray(data.receipts) ?  data.receipts : []);

    // system fields
    delete data.reimbursement_request_id;
    delete data.submitted_at;
    data.status = 'submitted';

    const validation = await this.entityFields.validate(data, ['reimbursement_request_id']);

    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    const expenses = data.expenses;
    delete data.expenses;
    const receipts = data.receipts;
    delete data.receipts;
    let out = {};
    let reimbursementRequestId;

    // start transaction
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      // get approval request data
      let approvalRequestData = await client.query('SELECT * FROM approval_request WHERE approval_request_id = $1 AND is_current = true', [data.approval_request_id]);
      approvalRequestData = approvalRequestData.rows[0];
      const approvalRequestRevisionId = approvalRequestData.approval_request_revision_id;

      // insert reimbursement request
      const d = pg.prepareObjectForInsert(data);
      let sql = `INSERT INTO reimbursement_request (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING reimbursement_request_id`;
      const res = await client.query(sql, d.values);
      reimbursementRequestId = res.rows[0].reimbursement_request_id;

      // insert expenses
      for ( const expense of expenses ){
        delete expense.reimbursement_request_expense_id;
        expense.reimbursement_request_id = reimbursementRequestId;
        const expenseData = pg.prepareObjectForInsert(expense);
        const sql = `INSERT INTO reimbursement_request_expense (${expenseData.keysString}) VALUES (${expenseData.placeholdersString})`;
        await client.query(sql, expenseData.values);
      }

      // insert receipts
      for ( const receipt of receipts ){
        delete receipt.reimbursement_request_receipt_id;
        receipt.reimbursement_request_id = reimbursementRequestId;
        const receiptData = pg.prepareObjectForInsert(receipt);
        const sql = `INSERT INTO reimbursement_request_receipt (${receiptData.keysString}) VALUES (${receiptData.placeholdersString})`;
        await client.query(sql, receiptData.values);
      }

      // set overall reimbursement status on approval request
      await this._updateApprovalRequestReimbursementStatus(client, reimbursementRequestId);

      // insert into approval request activity
      sql = `SELECT MAX(approver_order) as max_order FROM approval_request_approval_chain_link WHERE approval_request_revision_id = $1`;
      const maxOrderRes = await client.query(sql, [approvalRequestRevisionId]);
      const maxOrder = maxOrderRes.rows?.[0]?.max_order || 0;

      let activityData = {
        approval_request_revision_id: approvalRequestRevisionId,
        approver_order: maxOrder + 1,
        action: 'reimbursement-request-submitted',
        employee_kerberos: approvalRequestData.employee_kerberos,
        reimbursement_request_id: reimbursementRequestId
      }
      activityData = pg.prepareObjectForInsert(activityData);
      sql = `INSERT INTO approval_request_approval_chain_link (${activityData.keysString}) VALUES (${activityData.placeholdersString})  RETURNING approval_request_approval_chain_link_id`;
      let activityId = await client.query(sql, activityData.values);
      activityId = activityId.rows[0].approval_request_approval_chain_link_id;

      // insert "approver type"
      let approverTypeData = {
        approval_request_approval_chain_link_id: activityId,
        approver_type_id: 4
      }
      approverTypeData = pg.prepareObjectForInsert(approverTypeData);
      sql = `INSERT INTO link_approver_type (${approverTypeData.keysString}) VALUES (${approverTypeData.placeholdersString})`;
      await client.query(sql, approverTypeData.values);


      await client.query('COMMIT');

    } catch (e) {
      console.log('Error in createReimbursementRequest', e);
      await client.query('ROLLBACK');
      out = {error: e};
    } finally {
      client.release();
    }

    if ( out.error ) return out;

    return {success: true, reimbursementRequestId};

  }

  /**
   * @description Get reimbursement request receipts
   * @param {Object} query - query object with the following properties:
   * - reimbursementRequestIds: Array of reimbursement request ids
   * - receiptIds: Array of receipt ids
   * - filePath: Array of file paths
   * @param {Object} kwargs - optional keyword arguments with the following properties:
   * - returnReimbursementRequest: Boolean - if true, return the basic reimbursement request data associated with the receipt
   * @returns {Object|Array} - returns an array of receipt objects or an object with an error property
   */
  async getReceipts(query={}, kwargs={}){

    const returnReimbursementRequest = kwargs.returnReimbursementRequest || false;
    const whereArgs = {
      "1" : "1"
    };

    if ( Array.isArray(query.reimbursementRequestIds) && query.reimbursementRequestIds.length ) {
      whereArgs["reimbursement_request_id"] = query.reimbursementRequestIds;
    }

    if ( Array.isArray(query.receiptIds) && query.receiptIds.length ) {
      whereArgs["reimbursement_request_receipt_id"] = query.receiptIds;
    }

    if ( Array.isArray(query.filePath) && query.filePath.length ) {
      whereArgs["file_path"] = query.filePath;
    }

    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT *
      FROM
        reimbursement_request_receipt
      ${returnReimbursementRequest ? `
        LEFT JOIN
          reimbursement_request ON reimbursement_request.reimbursement_request_id = reimbursement_request_receipt.reimbursement_request_id
        ` : ''}
      WHERE ${whereClause.sql}
    `;

    const res = await pg.query(sql, whereClause.values);
    if( res.error ) return res;

    const out = [];
    for ( const row of res.res.rows ){
      const receipt = this.receiptFields.toJsonObj(row);
      out.push(receipt);
      if ( returnReimbursementRequest ){
        receipt.reimbursementRequest = this.entityFields.toJsonObj(row);
      }
    }
    return out;
  }

  /**
   * @description Create a reimbursement request fund transaction
   * @param {Object} data - fund transaction data. See this.fundTransactionFields for field names
   * @param {Object} submittedBy - employee object of the person submitting the transaction
   * @returns
   */
  async createFundTransaction(data, submittedBy){
    if ( submittedBy?.kerberos ) {
      data.addedBy = submittedBy.kerberos;
    }
    data = this.fundTransactionFields.toDbObj(data);

    // delete system fields
    delete data.added_at;
    delete data.modified_by;
    delete data.modified_at;
    delete data.reimbursement_request_fund_id;
    delete data.funding_source_label;
    delete data.funding_source_id;

    const validation = await this.fundTransactionFields.validate(data, ['reimbursement_request_fund_id']);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    // start transaction
    const client = await pg.pool.connect();
    let reimbursementRequestFundId;
    let out = {};
    let sql;
    let res;
    try {
      await client.query('BEGIN');

      if ( submittedBy?.kerberos ){
        await employeeModel.upsertInTransaction(client, submittedBy);
      }

      // insert fund transaction
      const d = pg.prepareObjectForInsert(data);
      sql = `INSERT INTO reimbursement_request_fund (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING reimbursement_request_fund_id`;
      res = await client.query(sql, d.values);
      reimbursementRequestFundId = res.rows[0].reimbursement_request_fund_id;

      await this._updateReimbursementRequestStatus(client, data.reimbursement_request_id);
      await this._updateApprovalRequestReimbursementStatus(client, data.reimbursement_request_id);
      await this._addTransactionToApprovalRequestHistory(client, reimbursementRequestFundId);

      await client.query('COMMIT');

    } catch (e) {
      console.log('Error in createFundTransaction', e);
      await client.query('ROLLBACK');
      out = {error: e};
    } finally {
      client.release();
    }

    if ( out.error ) return out;

    return {success: true, reimbursementRequestFundId};
  }

  /**
   * @description Add record of a transaction to the approval request history
   * @param {*} client - pg client
   * @param {Number} transactionId - the id of the transaction
   */
  async _addTransactionToApprovalRequestHistory(client, transactionId){
    let sql;
    let res;

    // get transaction data
    sql = `
      SELECT
        t.*,
        rr.approval_request_id,
        ar.approval_request_revision_id
      FROM
        reimbursement_request_fund t
      INNER JOIN
        reimbursement_request rr ON t.reimbursement_request_id = rr.reimbursement_request_id
      INNER JOIN
        approval_request ar ON rr.approval_request_id = ar.approval_request_id
      WHERE
        reimbursement_request_fund_id = $1
        AND ar.is_current = true
      `;
    res = await client.query(sql, [transactionId]);
    if ( !res.rows.length ) {
      throw new Error('Transaction not found');
    }
    const transaction = res.rows[0];

    // get max approver order - not sure this actually matters
    sql = `SELECT MAX(approver_order) as max_order FROM approval_request_approval_chain_link WHERE approval_request_revision_id = $1`;
    const maxOrderRes = await client.query(sql, [transaction.approval_request_revision_id]);
    const approver_order = (maxOrderRes.rows?.[0]?.max_order || 0) + 1;

    const historyData = {
      approval_request_revision_id: transaction.approval_request_revision_id,
      approver_order,
      action: transaction.modified_at ? 'reimbursement-transaction-updated' : 'reimbursement-transaction-added',
      employee_kerberos: transaction.modified_by ? transaction.modified_by : transaction.added_by,
      reimbursement_request_id: transaction.reimbursement_request_id,
      occurred: transaction.modified_at ? transaction.modified_at : transaction.added_at
    };

    const d = pg.prepareObjectForInsert(historyData);
    sql = `
      INSERT INTO approval_request_approval_chain_link (${d.keysString})
      VALUES (${d.placeholdersString})
      RETURNING approval_request_approval_chain_link_id
    `;
    res = await client.query(sql, d.values);
    const historyId = res.rows[0].approval_request_approval_chain_link_id;

    // insert approver type
    const approverTypeData = {
      approval_request_approval_chain_link_id: historyId,
      approver_type_id: 5 // application admin
    };
    const approverTypeInsert = pg.prepareObjectForInsert(approverTypeData);
    sql = `
      INSERT INTO link_approver_type (${approverTypeInsert.keysString})
      VALUES (${approverTypeInsert.placeholdersString})
    `;
    await client.query(sql, approverTypeInsert.values);
  }

  /**
   * @description Update the overall reimbursement request status of an approval request based on its individual reimbursement requests
   * @param {*} client - pg client
   * @param {Number} reimbursementRequestId - the id of the reimbursement request
   */
  async _updateApprovalRequestReimbursementStatus(client, reimbursementRequestId){
    let sql = `SELECT approval_request_id FROM reimbursement_request WHERE reimbursement_request_id = $1`;
    let res = await client.query(sql, [reimbursementRequestId]);
    const approvalRequestId = res.rows[0].approval_request_id;

    sql = `SELECT status FROM reimbursement_request WHERE approval_request_id = $1`;
    res = await client.query(sql, [approvalRequestId]);

    const statuses = res.rows.map(r => r.status);
    let overallStatus;
    if ( statuses.includes('partially-reimbursed') ){
      overallStatus = 'partially-reimbursed';
    } else if ( statuses.every(s => s === 'fully-reimbursed') ){
      overallStatus = 'fully-reimbursed';
    } else if ( statuses.includes('fully-reimbursed') ){
      overallStatus = 'partially-reimbursed';
    } else if(statuses.every(s => s === 'submitted')){
      overallStatus = 'submitted';
    } else if( !statuses.length ){
      overallStatus = 'not-submitted';
    } else {
      overallStatus = 'reimbursement-pending';
    }

    sql = `UPDATE approval_request SET reimbursement_status = $1 WHERE approval_request_id = $2 AND is_current = true`;
    await client.query(sql, [overallStatus, approvalRequestId]);
  }

  /**
   * @description Update the overall status of a reimbursement request based on its individual fund transactions
   * @param {*} client - pg client
   * @param {Number} reimbursementRequestId - the id of the reimbursement request
   */
  async _updateReimbursementRequestStatus(client, reimbursementRequestId){
    let sql = `SELECT reimbursement_status FROM reimbursement_request_fund WHERE reimbursement_request_id = $1`;
    let res = await client.query(sql, [reimbursementRequestId]);


    const statuses = res.rows.map(r => r.reimbursement_status);
    let overallStatus;
    if ( statuses.includes('partially-reimbursed') ){
      overallStatus = 'partially-reimbursed';
    } else if ( statuses.every(s => s === 'fully-reimbursed') ){
      overallStatus = 'fully-reimbursed';
    } else if ( statuses.includes('fully-reimbursed') ){
      overallStatus = 'partially-reimbursed';
    } else if(statuses.every(s => s === 'cancelled')){
      overallStatus = 'submitted';
    } else {
      overallStatus = 'reimbursement-pending';
    }

    sql = `UPDATE reimbursement_request SET status = $1 WHERE reimbursement_request_id = $2`;
    await client.query(sql, [overallStatus, reimbursementRequestId]);
  }

  /**
   * @description Update a reimbursement request fund transaction
   * @param {Object} data - fund transaction data. See this.fundTransactionFields for field names
   * @param {Object} submittedBy - employee object of the person submitting the transaction
   * @returns
   */
  async updateFundTransaction(data, submittedBy){
    if ( submittedBy?.kerberos ) {
      data.modifiedBy = submittedBy.kerberos;
    }
    data.modifiedAt = new Date();
    data = this.fundTransactionFields.toDbObj(data);

    // delete system fields
    delete data.added_at;
    delete data.added_by;
    delete data.funding_source_label;
    delete data.funding_source_id;

    const validation = await this.fundTransactionFields.validate(data);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    const reimbursementRequestFundId = data.reimbursement_request_fund_id;
    delete data.reimbursement_request_fund_id;

    // start transaction
    const client = await pg.pool.connect();
    let out = {};
    let sql;
    let res;

    try {
      await client.query('BEGIN');

      if ( submittedBy?.kerberos ){
        await employeeModel.upsertInTransaction(client, submittedBy);
      }

      // update fund transaction
      const updateClause = pg.toUpdateClause(data);
      sql = `
        UPDATE reimbursement_request_fund
        SET ${updateClause.sql}
        WHERE reimbursement_request_fund_id = $${updateClause.values.length + 1}
        RETURNING reimbursement_request_fund_id
      `
      res = await client.query(sql, [...updateClause.values, reimbursementRequestFundId]);
      if ( res.rowCount !== 1 ) {
        throw new Error('Error updating funding source transaction');
      }

      await this._updateReimbursementRequestStatus(client, data.reimbursement_request_id);
      await this._updateApprovalRequestReimbursementStatus(client, data.reimbursement_request_id);
      await this._addTransactionToApprovalRequestHistory(client, reimbursementRequestFundId);

      await client.query('COMMIT');

    } catch (e) {
      console.log('Error in updateFundTransaction', e);
      await client.query('ROLLBACK');
      out = {error: e};

    } finally {
      client.release();
    }

    if ( out.error ) return out;

    return {success: true, reimbursementRequestFundId};
  }

  /**
   * @description Get fund reimbursement transactions for a list of reimbursement request ids
   * @param {Array} reimbursementRequestIds - array of reimbursement request ids
   * @returns
   */
  async getFundTransactions(reimbursementRequestIds=[]){
    if ( !Array.isArray(reimbursementRequestIds) || !reimbursementRequestIds.length ) return {error: true, message: 'Invalid reimbursement request ids'};
    const whereClause = pg.toWhereClause({reimbursement_request_id: reimbursementRequestIds});

    const sql = `
      SELECT rrf.*,
      arfs.funding_source_id,
      fs.label as funding_source_label
      FROM
        reimbursement_request_fund rrf
      LEFT JOIN
        approval_request_funding_source arfs ON rrf.approval_request_funding_source_id = arfs.approval_request_funding_source_id
      LEFT JOIN
        funding_source fs ON arfs.funding_source_id = fs.funding_source_id
      WHERE
        ${whereClause.sql}
    `;

    const res = await pg.query(sql, whereClause.values);
    if ( res.error ) return res;

    const out = [];
    for ( const row of res.res.rows ){
      const d = this.fundTransactionFields.toJsonObj(row);
      d.amount = typeTransform.toPositiveNumber(d.amount) || 0;
      out.push(d);
    }
    return out;
  }

  /**
   * @description Get total reimbursement request reimbursement amount grouped by funding source and employee
   * @param {*} query 
   */
  async getTotalFundingSourceExpendituresByEmployee(query={}){
    const whereArgs = {'1': '1'};

    if ( query.employees ){
      whereArgs['ar.employee_kerberos'] = query.employees;
    }

    const fiscalYear = fiscalYearUtils.fromStartYear(query.fiscalYear, true);
    if ( fiscalYear ){
      whereArgs['fy_start'] = {relation: 'AND', 'ar.program_start_date' : {operator: '>=', value: fiscalYear.startDate({isoDate: true})}};
      whereArgs['fy_end'] = {relation: 'AND', 'ar.program_start_date' : {operator: '<=', value: fiscalYear.endDate({isoDate: true})}};
    }

    if ( query.approvalRequestReimbursementStatus ){
      whereArgs['ar.reimbursement_status'] = query.approvalRequestReimbursementStatus;
    }

    if ( query.reimbursementRequestStatus ){
      whereArgs['rr.status'] = query.reimbursementRequestStatus;
    }

    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT
        ar.employee_kerberos,
        arfs.funding_source_id,
        SUM(rrf.amount) as total_expenditures
      FROM
        reimbursement_request_fund rrf
      LEFT JOIN
        reimbursement_request rr ON rrf.reimbursement_request_id = rr.reimbursement_request_id
      LEFT JOIN
        approval_request ar ON rr.approval_request_id = ar.approval_request_id
      LEFT JOIN
        approval_request_funding_source arfs ON rrf.approval_request_funding_source_id = arfs.approval_request_funding_source_id
      WHERE
        ${whereClause.sql}
      GROUP BY
        ar.employee_kerberos,
        arfs.funding_source_id
    `;
    const res = await pg.query(sql, whereClause.values);
    if ( res.error ) return res;

    const fields = new EntityFields([
      {
        dbName: 'employee_kerberos',
        jsonName: 'employeeKerberos'
      },
      {
        dbName: 'funding_source_id',
        jsonName: 'fundingSourceId'
      },
      {
        dbName: 'total_expenditures',
        jsonName: 'totalExpenditures'
      }
    ]);

    return fields.toJsonArray(res.res.rows).map(row => {
      row.totalExpenditures = typeTransform.toPositiveNumber(row.totalExpenditures) || 0;
      return row;
    });

  }
}

export default new ReimbursementRequest();
