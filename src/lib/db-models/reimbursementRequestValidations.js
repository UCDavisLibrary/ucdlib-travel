import typeTransform from "../utils/typeTransform.js";
import approvalRequestModel from "./approvalRequest.js";
import applicationOptions from "../utils/applicationOptions.js";

export default class ReimbursementRequestValidations {

  constructor(model){
    this.model = model;
  }

  async approvalRequestId(field, value, out, payload){
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
    this.model.approvalRequest = approvalRequest;
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

  travelDates(field, value, out, payload){
    let error;
    if ( !this.model.approvalRequest?.travelRequired ) return;

    if ( typeof value !== 'string' ){
      error = {errorType: 'invalid', message: 'Invalid date'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    const [date, time] = value.split('T');
    if ( !date.match(/^\d{4}-\d{2}-\d{2}$/) ){
      error = {errorType: 'invalid', message: 'Invalid date'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }
    if (!time || !time.match(/^\d{2}:\d{2}$/)){
      error = {errorType: 'invalid', message: 'Invalid time'};
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
}
