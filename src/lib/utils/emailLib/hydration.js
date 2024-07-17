import serverConfig from "../../serverConfig.js";
import pg from "../../db-models/pg.js";
import fetch from 'node-fetch';

/**
 * @class Hydration
 * @description Utility class for querying the .
 * Does auth.
 */
export default class Hydration {

  constructor(approvalRequest={}, reimbursementRequest={}){
    this.approvalRequest = approvalRequest;
    this.reimbursementRequest = reimbursementRequest
  }

_getRequesterFirstName(){
  return this.approvalRequest.employee.firstName;
}

_getRequesterLastName(){
  return this.approvalRequest.employee.lastName;
}

_getRequesterFullName(){
  return `${this._getRequesterFirstName()} ${this._getRequesterLastName()}`;
}

_getRequesterKerberos(){
  return this.approvalRequest.employeeKerberos;
}

_getRequesterLabel(){
  return this.approvalRequest.label;
}

_getRequesterOrganization(){
  return this.approvalRequest.organization;
}

_getRequesterBuisnessPurpose(){
  return this.approvalRequest.businessPurpose;
}

_getRequesterLocation(){
  return this.approvalRequest.locationDetails;
}

_getRequesterProgramDate(){
  return `${this.approvalRequest.programStartDate} - ${this.approvalRequest.programEndDate} `;
}

_getRequesterTravelDate(){
  return `${this.approvalRequest.programStartDate} - ${this.approvalRequest.programEndDate} ` || 'Not Included';
}

_getRequesterComments(){
  return this.approvalRequest.comments;
}

_getNextApproverFullName(){
  let results = this.approvalRequest.approvalStatusActivity.filter(x => x.action == 'approval-needed');
  return `${results[0].employee.firstName} ${results[0].employee.lastName}`;
}

_getNextApproverFundChanges(){
  let results = this.approvalRequest.approvalStatusActivity.filter(x => x.action == 'approval-needed');
  return results[0].fundChanges;
}

_getNextApproverKerberos(){
  let results = this.approvalRequest.approvalStatusActivity.filter(x => x.action == 'approval-needed');
  return results[0].employeeKerberos;
}

_getReimbursementLabel(){
  return this.reimbursementRequest.label;
}

_getReimbursementEmployeeResidence(){
  return this.reimbursementRequest.employeeResidence;
}

_getReimbursementTravelDate(){
  return `${this.reimbursementRequest.travelStart} - ${this.reimbursementRequest.travelEnd} ` || 'Not Included';
}

_getReimbursementPersonalTime(){
  return this.reimbursementRequest.personalTime;
}

_getReimbursementComments(){
  return this.reimbursementRequest.comments;
}

_getReimbursementStatus(){
  return this.reimbursementRequest.status;
}

_getApprovalRequestUrl(){
  return `localhost:3000/approval-request/${this.approvalRequest.approvalRequestId}`;
}

_getReimbursementRequestUrl(){
  return `localhost:3000/reimbursement-request/${this.reimbursementRequest.reimbursementRequestId}`;
}


_getContext(content){
  // extract variables from content string
  const variables = content.split('{{').slice(1).map(x => x.split('}}')[0]);

  // get values from approvalRequest/reimbursmentRequest
  const context = {};
  for (let v of variables) {
    context[v] = this._getVariableFunction(v)
  }
  return context;
}

_getVariableFunction(variable){
  // return method for getting data for variable

  if (variable === 'requesterFirstName') return this._getRequesterFirstName();
  if (variable === 'requesterLastName') return this._getRequesterLastName();
  if (variable === 'requesterFullName') return this._getRequesterFullName();
  if (variable === 'requesterKerberos') return this._getRequesterKerberos();
  if (variable === 'requesterLabel') return this._getRequesterLabel();
  if (variable === 'requesterOrganization') return this._getRequesterOrganization();
  if (variable === 'requesterBuisnessPurpose') return this._getRequesterBuisnessPurpose();
  if (variable === 'requesterLocation') return this._getRequesterLocation();
  if (variable === 'requesterProgramDate') return this._getRequesterProgramDate();
  if (variable === 'requesterTravelDate') return this._getRequesterTravelDate();
  if (variable === 'requesterComments') return this._getRequesterComments();
  if (variable === 'nextApproverFullName') return this._getNextApproverFullName();
  if (variable === 'nextApproverFundChanges') return this._getNextApproverFundChanges();
  if (variable === 'nextApproverKerberos') return this._getNextApproverKerberos();
  if (variable === 'reimbursementLabel') return this._getReimbursementLabel();
  if (variable === 'reimbursementEmployeeResidence') return this._getReimbursementEmployeeResidence();
  if (variable === 'reimbursementTravelDate') return this._getReimbursementTravelDate();
  if (variable === 'reimbursementPersonalTime') return this._getReimbursementPersonalTime();
  if (variable === 'reimbursementComments') return this._getReimbursementComments();
  if (variable === 'reimbursementStatus') return this._getReimbursementStatus();
  if (variable === 'approvalRequestUrl') return this._getApprovalRequestUrl();
  if (variable === 'reimbursementRequestUrl') return this._getReimbursementRequestUrl();
  // etc
  return () => {return ''}
}

hydrate(content){
  const context = this._getContext(content);
  return this._evaluateTemplate(content, context);
}

_evaluateTemplate(template, context) {
  template = template.replaceAll('{{', '${').replaceAll('}}', '}');
  const templateFunction = new Function(...Object.keys(context), `return \`${template}\`;`);

  return templateFunction(...Object.values(context)).replace(/[ \t]{1,}/g, ' ');
}

}
 