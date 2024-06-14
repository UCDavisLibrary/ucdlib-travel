import pg from "./pg.js";

/**
 * @class ApprovalRequestValidations
 * @classdesc Methods for validating the fields of the ApprovalRequest model
 * should be passed to the customValidation property of the EntityFields field definition
 * @property {Object} model - the ApprovalRequest model object
 */
export default class ApprovalRequestValidations {

  constructor(model){
    this.model = model;

    this.validApprovalStatuses = [
      {value: 'draft', label: 'Draft'},
      {value: 'submitted', label: 'Submitted'},
      {value: 'in-progress', label: 'In Progress'},
      {value: 'approved', label: 'Approved', isFinal: true},
      {value: 'canceled', label: 'Canceled', isFinal: true},
      {value: 'denied', label: 'Denied', isFinal: true},
      {value: 'revision-requested', label: 'Revision Requested'}
    ];

    this.validReimbursementStatuses = [
      {value: 'not-required', label: 'Not Required'},
      {value: 'not-submitted', label: 'Not Submitted'},
      {value: 'reimbursment-pending', label: 'Reimbursement Pending'},
      {value: 'partially-reimbursed', label: 'Partially Reimbursed'},
      {value: 'fully-reimbursed', label: 'Fully Reimbursed'}
    ];

    this.approvalStatusActions = [
      {value: 'approve', label: 'Approve', actor: 'approver'},
      {value: 'approve-with-changes', label: 'Approve with Changes', actor: 'approver'},
      {value: 'deny', label: 'Deny', actor: 'approver'},
      {value: 'cancel', label: 'Cancel', actor: 'submitter'},
      {value: 'request-revision', label: 'Request Revision', actor: 'approver'},
      {value: 'submit', label: 'Submit', actor: 'submitter'}
    ];
  }

  /**
   * @method approvalStatus
   * @description Custom validation for the approvalStatus field
   * See EntityFields.validate method for property definitions.
   */
  approvalStatus(field, value, out, payload){
    let error;

    if ( value === undefined || value === null || value === '') {
      error = {errorType: 'required', message: 'This field is required.'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    const validStatuses = this.validApprovalStatuses.map(status => status.value);
    error = {errorType: 'invalid-value', message: `Invalid approval status: ${value}`};
    if ( !validStatuses.includes(value) ) {
      this.model.entityFields.pushError(out, field, error);
    }
  }

  /**
   * @method reimbursementStatus
   * @description Custom validation for the reimbursementStatus field
   * See EntityFields.validate method for property definitions.
   */
  reimbursementStatus(field, value, out, payload){
    let error;

    if ( value === undefined || value === null || value === '') {
      error = {errorType: 'required', message: 'This field is required.'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    const validStatuses = this.validReimbursementStatuses.map(status => status.value);
    error = {errorType: 'invalid-value', message: `Invalid reimbursement status: ${value}`};
    if ( !validStatuses.includes(value) ) {
      this.model.entityFields.pushError(out, field, error);
    }
  }

  /**
   * @method requireIfNotDraft
   * @description Returns error if value is empty and approvalStatus is not draft
   */
  requireIfNotDraft(field, value, out, payload){
    let error;

    if ( payload.approval_status === 'draft' && !payload.forceValidation ) return;
    error = {errorType: 'required', message: 'This field is required.'};
    if ( value === undefined || value === null || value === '') {
      this.model.entityFields.pushError(out, field, error);
    }
  }

  /**
   * @method location
   * @description Custom validation for the location field
   * See EntityFields.validate method for property definitions.
   */
  location(field, value, out, payload){
    let error;

    if ( payload.approval_status === 'draft' && !payload.forceValidation ) return;

    error = {errorType: 'required', message: 'This field is required.'};
    if ( value === undefined || value === null || value === '') {
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    const validLocations = ['in-state', 'out-of-state', 'foreign', 'virtual'];
    error = {errorType: 'invalid-value', message: `Invalid location: ${value}`};
    if ( !validLocations.includes(value) ) {
      this.model.entityFields.pushError(out, field, error);
    }
  }

  /**
   * @method locationDetails
   * @description Custom validation for the locationDetails field
   * See EntityFields.validate method for property definitions.
   */
  locationDetails(field, value, out, payload){
    let error;
    if ( payload.approval_status === 'draft' && !payload.forceValidation ) return;
    if ( payload.location === 'virtual' ) return;

    error = {errorType: 'required', message: 'This field is required.'};
    if ( value === undefined || value === null || value === '') {
      this.model.entityFields.pushError(out, field, error);
    }
  }

  /**
   * @method programDate
   * @description Custom validation for the programStartDate and programEndDate fields
   * See EntityFields.validate method for property definitions.
   */
  programDate(field, value, out, payload){
    let error;

    if ( payload.approval_status === 'draft' && !payload.forceValidation ) return;

    // verify field is not empty
    error = {errorType: 'required', message: 'This field is required.'};
    if ( value === undefined || value === null || value === '') {
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    // verify field doesnt already have an error
    if ( this.model.entityFields.fieldHasError(out, 'programStartDate') || this.model.entityFields.fieldHasError(out, 'programEndDate') ) return;

    // verify program start date is before or equal to program end date
    try {
      const startDate = new Date(payload.program_start_date);
      const endDate = new Date(payload.program_end_date);
      if ( startDate <= endDate ) return;
      const error = {errorType: 'invalid', message: 'Program start date must be before the end date'};
      if ( field.jsonName === 'programEndDate' ) {
        error.message = 'Program end date must be after start date';
      }
      this.model.entityFields.pushError(out, field, error);
    } catch (e) {
      // one of the dates is invalid and will be caught by the date validation
    }
  }

  /**
   * @method travelDate
   * @description Custom validation for the travelStartDate and travelEndDate fields
   * See EntityFields.validate method for property definitions.
   */
  travelDate(field, value, out, payload){
    let error;

    if ( payload.approval_status === 'draft' && !payload.forceValidation ) return;
    if ( !payload.travel_required ) return;

    // verify field is not empty
    error = {errorType: 'required', message: 'This field is required.'};
    if ( value === undefined || value === null || value === '') {
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    // verify field doesnt already have an error
    if ( this.model.entityFields.fieldHasError(out, 'travelStartDate') || this.model.entityFields.fieldHasError(out, 'travelEndDate') ) return;

    // verify travel start date is before or equal to travel end date
    try {
      const startDate = new Date(payload.travel_start_date);
      const endDate = new Date(payload.travel_end_date);
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

  /**
   * @method expenditures
   * @description Custom validation for the expenditures field
   * See EntityFields.validate method for property definitions.
   */
  async expenditures(field, value, out, payload){
    let error;

    if ( payload.approval_status === 'draft' && !payload.forceValidation ) return;
    if ( payload.no_expenditures ) return;

    // verify is array and not empty
    error = {errorType: 'required', message: 'This field is required.'};
    if ( !Array.isArray(value) || value.length === 0 ) {
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    // verify expenditureOptionId is an integer
    error = {errorType: 'invalid', message: 'All expenditure option ids must be integers'};
    for (const expenditure of value) {
      if ( !Number.isInteger(expenditure.expenditureOptionId) ) {
        this.model.entityFields.pushError(out, field, error);
        return;
      }
    }

    // verify expenditureOptionId exists in the database
    const expenditureOptionIds = value.map(expenditure => expenditure.expenditureOptionId);
    let query = `SELECT expenditure_option_id FROM expenditure_option WHERE expenditure_option_id = ANY($1)`;
    let res = await pg.query(query, [expenditureOptionIds]);
    if ( res.error ) {
      this.model.entityFields.pushError(out, field, {errorType: 'database', message: 'Error querying the database for expenditure options'});
      console.error(res.error);
      return;
    }
    if ( res.res.rowCount !== expenditureOptionIds.length ) {
      this.model.entityFields.pushError(out, field, {errorType: 'invalid', message: 'An expenditure option does not exist in the database'});
      return;
    }

    // check that amount for each expenditure is a number
    error = {errorType: 'invalid', message: 'All expenditure amounts must be numbers'};
    for (const expenditure of value) {
      if ( isNaN(Number(expenditure.amount)) ) {
        this.model.entityFields.pushError(out, field, error);
        return;
      }
    }

    // verify that total amount is greater than 0
    const totalAmount = value.reduce((acc, expenditure) => acc + Number(expenditure.amount), 0);
    if ( totalAmount <= 0 ) {
      this.model.entityFields.pushError(out, field, {errorType: 'invalid', message: 'The total expenditure amount must be greater than 0'});
    }
  }

  /**
   * @method fundingSources
   * @description Custom validation for the fundingSources field
   * See EntityFields.validate method for property definitions.
   */
  async fundingSources(field, value, out, payload){
    if ( payload.approval_status === 'draft' && !payload.forceValidation ) return;
    if ( payload.no_expenditures ) return;
    let error;

    // verify is array and not empty
    error = {errorType: 'required', message: 'This field is required.'};
    if ( !Array.isArray(value) || value.length === 0 ) {
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    // verify fundingSourceId is an integer
    error = {errorType: 'invalid', message: 'A funding source is missing a funding source id'};
    for (const fundingSource of value) {
      if ( !Number.isInteger(fundingSource.fundingSourceId) ) {
        this.model.entityFields.pushError(out, field, error);
        return;
      }
    }

    // verify fundingSourceId exists in the database
    const fundingSourceIds = value.map(fundingSource => fundingSource.fundingSourceId);
    let query = `SELECT funding_source_id, require_description FROM funding_source WHERE funding_source_id = ANY($1)`;
    let res = await pg.query(query, [fundingSourceIds]);
    if ( res.error ) {
      this.model.entityFields.pushError(out, field, {errorType: 'database', message: 'Error querying the database for funding sources'});
      console.error(res.error);
      return;
    }
    if ( res.res.rowCount !== fundingSourceIds.length ) {
      this.model.entityFields.pushError(out, field, {errorType: 'invalid', message: 'A funding source does not exist in the database'});
      return;
    }

    // check for description if required by funding source
    // and character limit
    const fsNeedsDesc = res.res.rows.filter(fundingSource => fundingSource.require_description).map(fundingSource => fundingSource.funding_source_id);
    for (const fundingSource of value) {
      if ( fsNeedsDesc.includes(fundingSource.fundingSourceId) && !fundingSource.description ) {
        this.model.entityFields.pushError(out, field, {errorType: 'required', message: 'A funding source requires a description'});
        return;
      }

      if ( fundingSource.description && fundingSource.description.length > 500 ) {
        this.model.entityFields.pushError(out, field, {errorType: 'charLimit', message: 'Description must be less than 500 characters'});
        return;
      }
    }

    // check that amount for each funding source is a number
    error = {errorType: 'invalid', message: 'All funding source amounts must be numbers'};
    for (const fundingSource of value) {
      if ( isNaN(Number(fundingSource.amount)) ) {
        this.model.entityFields.pushError(out, field, error);
        return;
      }
    }

    // check that total amount matches the total amount of the expenditures
    const fundingTotal = value.reduce((acc, fundingSource) => acc + Number(fundingSource.amount), 0);
    const expenditureTotal = (Array.isArray(payload.expenditures) ? payload.expenditures : []).reduce((acc, expenditure) => acc + Number(expenditure.amount), 0);
    if ( fundingTotal !== expenditureTotal ) {
      this.model.entityFields.pushError(out, field, {errorType: 'invalid', message: 'The total funding amount must match the total expenditure amount'});
    }
  }

  /**
   * @method approvalRequestId
   * @description Custom validation for the approvalRequestId field
   * See EntityFields.validate method for property definitions.
   */
  async approvalRequestId(field, value, out, payload){
    let error;

    if ( !value ) return;

    // this is a revision, check that the approvalRequestId is an integer and exists in the database
    error = {errorType: 'invalid', message: 'Invalid approval request id'};
    if ( !Number.isInteger(value) ) {
      this.model.entityFields.pushError(out, field, error);
      return;
    }

    let query = `SELECT approval_request_id, approval_status FROM approval_request WHERE approval_request_id = $1`;
    let res = await pg.query(query, [value]);
    if ( res.error ) {
      this.model.entityFields.pushError(out, field, {errorType: 'database', message: 'Error querying the database for approval request'});
      console.error(res.error);
      return;
    }
    if ( !res.res.rowCount ) {
      this.model.entityFields.pushError(out, field, error);
    }

    error = {errorType: 'invalid', message: "Approval request must be in 'draft' or 'revision-requested' status to be revised"};
    if ( !['draft', 'revision-requested'].includes(res.res.rows[0].approval_status) ) {
      this.model.entityFields.pushError(out, field, error);
    }
  }

  /**
   * @method employee
   * @description Custom validation for the employee field
   * See EntityFields.validate method for property definitions.
   */
  employee(field, value, out, payload){
    let error;
    if ( typeof employee_kerberos === 'string' && employee_kerberos.length > 0 ) return;

    if ( !value?.kerberos ) {
      error = {errorType: 'required', message: 'This field is required.'};
      this.model.entityFields.pushError(out, field, error);
      return;
    }
  }

}
