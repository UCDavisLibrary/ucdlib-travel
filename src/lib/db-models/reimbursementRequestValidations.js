import typeTransform from "../utils/typeTransform.js";
import approvalRequestModel from "./approvalRequest.js";
import applicationOptions from "../utils/applicationOptions.js";
import reimbursmentExpenses from "../utils/reimbursmentExpenses.js";

export default class ReimbursementRequestValidations {

  constructor(model){
    this.model = model;
  }

  async approvalRequestId(field, value, out, payload, cache){
    let error;

    const approvalRequestId = typeTransform.toPositiveInt(value);
    if ( !approvalRequestId ){
      error = {errorType: 'required', message: 'This field is required.'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    let approvalRequest = await approvalRequestModel.get({requestIds: [approvalRequestId], isCurrent: true});
    if ( approvalRequest.error ){
      error = {errorType: 'database', message: 'Error fetching associated approval request'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }
    if ( !approvalRequest.total ){
      error = {errorType: 'notFound', message: 'Approval request not found'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    approvalRequest = approvalRequest.data[0];
    cache.approvalRequest = approvalRequest;
    if ( approvalRequest.approvalStatus !== 'approved' ){
      error = {errorType: 'invalid', message: 'Approval request has not been approved'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    const reimbursementStatuses = applicationOptions.reimbursementStatuses.filter(s => s.isActive).map(s => s.value);
    if ( !reimbursementStatuses.includes(approvalRequest.reimbursementStatus) ){
      error = {errorType: 'invalid', message: 'Cannot create reimbursement request for this approval request'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }
  }

  travelDates(field, value, out, payload, cache){
    let error;
    if ( !cache?.approvalRequest?.travelRequired ) return;

    if ( !typeTransform.toDateFromISO(value) ){
      error = {errorType: 'invalid', message: 'A valid date is required'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    if ( this.model.entityFields.fieldHasError(out, 'travelStart') || this.model.entityFields.fieldHasError(out, 'travelEnd') ) return;

    // verify travel start date is before or equal to travel end date
    try {
      const startDate = new Date(payload.travel_start);
      const endDate = new Date(payload.travel_end);
      if ( startDate <= endDate ) return;
      const error = {errorType: 'invalid', message: 'Travel start date must be before the end date'};
      if ( field.jsonName === 'travelEndDate' ) {
        error.message = 'Travel end date must be after start date';
      }
      this.model.entityFields.pushError(out, field, error);
    } catch (e) {
      // one of the dates is invalid and will be caught by the date validation
    }
  }

  status(field, value, out){
    const statuses = applicationOptions.reimbursementRequestStatuses.map(s => s.value);
    if ( !statuses.includes(value) ){
      const error = {errorType: 'invalid', message: 'Invalid status'};
      this.model.entityFields.pushError(out, field, error);
    }
  }

  async receipts(field, value, out){
    const skipFields = ['reimbursement_request_receipt_id', 'reimbursement_request_id'];
    const errors = [];
    for (const receipt of value){
      const receiptValidations = await this.model.receiptFields.validate(receipt, skipFields);
      if ( receiptValidations.valid ) continue;
      for (const receiptField of receiptValidations.fieldsWithErrors){
        const error = receiptField.errors[0];
        if ( !errors.find(e => e.subField === receiptField.jsonName) ){
          error.message = `${receiptField.label ? receiptField.label : receiptField.jsonName}: ${error.message}`
          errors.push({...error, subField: receiptField.jsonName});
        }
      }
    }
    for (const error of errors){
      this.model.entityFields.pushError(out, field, error);
    }
  }



  async expenses(field, value, out){
    const skipFields = ['reimbursement_request_expense_id', 'reimbursement_request_id'];
    const errors = [];
    for (const expense of value){
      const expenseValidations = await this.model.expenseFields.validate(expense, skipFields);
      if ( expenseValidations.valid ) continue;
      for (const expenseField of expenseValidations.fieldsWithErrors){
        const error = expenseField.errors[0];
        if ( !errors.find(e => e.subField === error.subField && e.expenseField === error.expenseField) ){
          errors.push(error);
        }
      }
    }
    for (const error of errors){
      this.model.entityFields.pushError(out, field, error);
    }
  }

  expenseAmount(field, value, out, payload){
    const subField = payload.category;
    const expenseField = field.jsonName;
    if ( subField === 'transportation' && payload?.details?.subCategory === 'private-car' ) return;
    const amount = typeTransform.toPositiveNumber(value);
    if ( !amount ){
      const error = {errorType: 'required', message: 'An amount value is missing.', subField, expenseField};
      this.model.expenseFields.pushError(out, field, error);
      return;
    }
  }

  expenseDate(field, value, out, payload){
    const subField = payload.category;
    const expenseField = field.jsonName;
    if ( subField != 'daily-expense' ) return;
    const date = typeTransform.toDateFromISO(value);
    if ( !date ) {
      const error = {errorType: 'invalid', message: 'A valid date field is required.', subField, expenseField};
    }
  }

  expenseCategory(){
    const subField = payload.category;
    const expenseField = field.jsonName;

    const validCategories = reimbursmentExpenses.allCategories.map(c => c.value);
    if ( !validCategories.includes(value) ){
      const error = {errorType: 'invalid', message: 'Invalid category', subField, expenseField};
      this.model.expenseFields.pushError(out, field, error);
    }

  }

  expenseDetails(field, value, out, payload){
    const details = value;
    const subField = payload.category;
    const expenseField = field.jsonName;
    const category = reimbursmentExpenses.allCategories.find(c => c.value === subField);
    const subCategories = (category?.subCategories || []).map(c => c.value);
    const subCategoryValue = details?.subCategory;
    const subCategory = (category?.subCategories || []).find(c => c?.value === subCategoryValue);

    if ( subCategories.length && !subCategories.includes(subCategoryValue) ){
      const error = {errorType: 'invalid', message: 'Invalid expense sub-category', subField, expenseField};
      this.model.expenseFields.pushError(out, field, error);
      return;
    }

    for (const detail of category.requiredDetails){
      if ( !details[detail.value] ){
        const error = {errorType: 'required', message: `'${detail.label}' field is required.`, subField, expenseField};
        this.model.expenseFields.pushError(out, field, error);
      }
    }
    if ( Array.isArray(subCategory?.requiredDetails)){
      for (const detail of subCategory.requiredDetails){
        if ( !details[detail.value] ){
          const error = {errorType: 'required', message: `'${detail.label}' field is required.`, subField, expenseField};
          this.model.expenseFields.pushError(out, field, error);
        }
      }
    }

  }
}
