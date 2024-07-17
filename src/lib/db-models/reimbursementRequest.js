import pg from "./pg.js";

import validations from "./reimbursementRequestValidations.js";
import EntityFields from "../utils/EntityFields.js";

class ReimbursementRequest {
  constructor(){

    this.validations = new validations(this);

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
        validateType: 'integer'
      },
      {
        dbName: 'reimbursement_request_id',
        jsonName: 'reimbursementRequestId'
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
    ]);

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
    ]);
  }

  async create(data){

    data = this.entityFields.toDbObj(data);
    data.expenses = this.expenseFields.toDbArray(Array.isArray(data.expenses) ?  data.expenses : []);
    data.receipts = this.receiptFields.toDbArray(Array.isArray(data.receipts) ?  data.receipts : []);

    // system fields
    delete data.reimbursement_request_id
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

      // insert approval request revision
      data = pg.prepareObjectForInsert(data);
      const sql = `INSERT INTO reimbursement_request (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING reimbursement_request_id`;
      const res = await client.query(sql, data.values);
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
      if ( returnReimbursementRequest ){
        receipt.reimbursementRequest = this.entityFields.toJsonObj(row);
      }
      out.push(receipt);
    }
    return out;
  }
}

export default new ReimbursementRequest();
