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
      }
    ]);
  }

  async create(data){

    data = this.entityFields.toDbObj(data);
    data.expenses = this.expenseFields.toDbArray(Array.isArray(data.expenses) ?  data.expenses : []);

    // system fields
    delete data.reimbursement_request_id
    data.status = 'submitted';

    const validation = await this.entityFields.validate(data, ['reimbursement_request_id']);

    // wait 2 seconds
    //await new Promise(resolve => setTimeout(resolve, 2000));


    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    return {success: true};

  }
}

export default new ReimbursementRequest();
