import pg from "./pg.js";
import typeTransform from "../utils/typeTransform.js";
import applicationOptions from "../utils/applicationOptions.js";

export default class FundTransactionValidations {

  constructor(model){
    this.model = model;
  }

  async reimbursementRequestFundId(field, value, out){
    const reimbursementRequestFundId = typeTransform.toPositiveInt(value);
    if ( !reimbursementRequestFundId ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'required', message: 'This field is required.'});
      return;
    }

    const res = await pg.query('SELECT * FROM reimbursement_request_fund WHERE reimbursement_request_fund_id = $1', [reimbursementRequestFundId]);
    if ( res.error ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'database', message: 'Error fetching associated reimbursement transaction'});
      return;
    }

    if ( !res.res.rowCount ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'notFound', message: 'Reimbursement transaction not found'});
      return;
    }
  }

  async reimbursementRequestId(field, value, out){
    const reimbursementRequestId = typeTransform.toPositiveInt(value);
    if ( !reimbursementRequestId ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'required', message: 'This field is required.'});
      return;
    }

    const res = await pg.query('SELECT * FROM reimbursement_request WHERE reimbursement_request_id = $1', [reimbursementRequestId]);
    if ( res.error ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'database', message: 'Error fetching associated reimbursement request'});
      return;
    }

    if ( !res.res.rowCount ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'notFound', message: 'Reimbursement request not found'});
      return;
    }
  }

  async approvalRequestFundingSourceId(field, value, out){
    const approvalRequestFundingSourceId = typeTransform.toPositiveInt(value);
    if ( !approvalRequestFundingSourceId ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'required', message: 'This field is required.'});
      return;
    }

    const res = await pg.query('SELECT * FROM approval_request_funding_source WHERE approval_request_funding_source_id = $1', [approvalRequestFundingSourceId]);
    if ( res.error ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'database', message: 'Error fetching associated funding source'});
      return;
    }

    if ( !res.res.rowCount ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'notFound', message: 'Funding source not found'});
      return;
    }
  }

  amount(field, value, out){
    const amount = typeTransform.toPositiveNumber(value);
    if ( !amount && amount !== 0 ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'required', message: 'This field is required.'});
      return;
    }
  }

  reimbursementStatus(field, value, out){
    const validOptions = applicationOptions.reimbursementTransactionStatuses.map(s => s.value);
    if ( !validOptions.includes(value) ){
      this.model.fundTransactionFields.pushError(out, field, {errorType: 'invalid', message: 'Invalid reimbursement transaction status'});
      return;
    }
  }

}
