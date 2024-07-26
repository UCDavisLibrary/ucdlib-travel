import serverConfig from "../../serverConfig.js";
import employee from "../../db-models/employee.js";
import settings from "../../db-models/settings.js";

/**
 * @class Hydration
 * @description Utility class for querying the .
 * Does auth.
 */
export default class Hydration {

  constructor(approvalRequest={}, reimbursementRequest={}, notificationType='request'){
    this.approvalRequest = approvalRequest;
    this.reimbursementRequest = reimbursementRequest,
    this.type = notificationType;
  }

approvers(){
  if(this.type == "request" || this.type == "next-approver") return this.approvalRequest.approvalStatusActivity.filter(x => x.action == 'approval-needed');
  if(this.type == "request-cancel") return this.approvalRequest.approvalStatusActivity.filter(x => (x.action == 'approved') || (x.action == 'approved-with-changes'));

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
  let results = this.approvers();
  return `${results[0].employee.firstName} ${results[0].employee.lastName}`;
}

_getNextApproverFundChanges(){
  let results = this.approvers();
  return results[0].fundChanges;
}

_getNextApproverKerberos(){
  let results = this.approvers();
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
  return `${serverConfig.appRoot}/approval-request/${this.approvalRequest.approvalRequestId}`;
}

_getReimbursementRequestUrl(){
  return `${serverConfig.appRoot}/reimbursement-request/${this.reimbursementRequest.reimbursementRequestId}`;
}

async _getRequesterEmail(){
  let emp = {};
  emp.emp = await employee.getIamRecordById(this.approvalRequest.employeeKerberos);
  return emp.emp.res.email;
}

async _getNextApproverEmail(){
  let emp = {};
  let results = this.approvers("approved");

  let approver = results[0].employeeKerberos;

  emp.emp = await employee.getIamRecordById(approver);

  return emp.emp.res.email;
}

async _getAllApprovedEmail(){
  let emp = {};
  let emps = [];
  let results = this.approvers("allApprover");

  for(let r of results) {
    emp.emp = await employee.getIamRecordById(r.employeeKerberos);
    emps.push(emp.emp.res.email);
  }

  return emps;
}

async _getHrEmail(){
  return settings.getByKey("admin_hr_email_address").default_value;
}



_getContext(content){
  // extract variables from content string
  const variables = content.split('${').slice(1).map(x => x.split('}')[0]);

  this._variables = [
    {name: 'requesterFirstName', cb: this._getRequesterFirstName()},
    {name: 'requesterLastName', cb: this._getRequesterLastName()},
    {name: 'requesterFullName', cb: this._getRequesterFullName()},
    {name: 'requesterKerberos', cb: this._getRequesterKerberos()},
    {name: 'requesterLabel', cb: this._getRequesterLabel()},
    {name: 'requesterOrganization', cb: this._getRequesterOrganization()},
    {name: 'requesterBuisnessPurpose', cb: this._getRequesterBuisnessPurpose()},
    {name: 'requesterLocation', cb: this._getRequesterLocation()},
    {name: 'requesterProgramDate', cb: this._getRequesterProgramDate()},
    {name: 'requesterTravelDate', cb: this._getRequesterTravelDate()},
    {name: 'requesterComments', cb: this._getRequesterComments()},
    {name: 'nextApproverFullName', cb: this._getNextApproverFullName()},
    {name: 'nextApproverFundChanges', cb: this._getNextApproverFundChanges()},
    {name: 'nextApproverKerberos', cb: this._getNextApproverKerberos()},
    {name: 'reimbursementLabel', cb: this._getReimbursementLabel()},
    {name: 'reimbursementEmployeeResidence', cb: this._getReimbursementEmployeeResidence()},
    {name: 'reimbursementTravelDate', cb: this._getReimbursementTravelDate()},
    {name: 'reimbursementPersonalTime', cb: this._getReimbursementPersonalTime()},
    {name: 'reimbursementComments', cb: this._getReimbursementComments()},
    {name: 'reimbursementStatus', cb: this._getReimbursementStatus()},
    {name: 'approvalRequestUrl', cb: this._getApprovalRequestUrl()},
    {name: 'reimbursementRequestUrl', cb: this._getReimbursementRequestUrl()}
  ];
  // get values from approvalRequest/reimbursmentRequest
  const context = {};
  for (let v of variables) {
    const found = this._variables.find((element) => element.name == v);

    if(found) context[found.name] = found.cb;
  }


  return context;
}

  hydrate(content){
    const context = this._getContext(content);
    return this._evaluateTemplate(content, context);
  }

  _evaluateTemplate(template, context) {
    const templateFunction = new Function(...Object.keys(context), `return \`${JSON.stringify(template)}\`;`);
    return templateFunction(...Object.values(context));
  }

  getNotificationRecipient(){
    let recipient;

    /* Requester 
      - Approver denies, changes requested, or approves but modifies request
      - All approvers in chain have approved request
      - Finance/HR completed of funded trip send xx number of hours (from settings) 
      - Finance/HR enters reimbursement into Aggie Expense
      - Finance/HR states one of the reimbursement refund goes through
      - Finance/HR states all reimbursement refunds are complete
    */
      if(this.type == 'approver-change' ||
         this.type == 'chain-completed' ||
         this.type == 'funded-hours' ||
         this.type == 'enter-reimbursement' ||
         this.type == 'reimbursement-refund' ||
         this.type == 'reimbursement-completed' 
        ) recipient = this._getRequesterEmail();
   
      
    /* One/Next Approver 
      - Requester submits/resubmits approval request
      - An approver approves approval request
      -
    */
      if(this.type == 'request' ||
         this.type == 'next-approver'
        ) recipient = this._getNextApproverEmail();

    /* Many Approvers 
      - Requester recalls/cancels approval request
    */
      if(this.type == 'request-cancel') recipient = this._getAllApprovedEmail();

    /* Finance/HR  
      - Requester submits reimbursement
    */
      if(this.type == 'submit-reimbursement') recipient = this._getHrEmail();

    return recipient;

  }

}
 

