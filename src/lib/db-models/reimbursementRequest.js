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

    return {success: true};

  }
}

export default new ReimbursementRequest();
