import serverConfig from "../../serverConfig.js";
import employee from "../../db-models/employee.js";
import settings from "./settings.js";

/**
 * @class Hydration
 * @description Utility class for hydrating the email text based on type.
 */
export default class Hydration {

  constructor(approvalRequest={}, reimbursementRequest={}, notificationType='request'){
    this.approvalRequest = approvalRequest;
    this.reimbursementRequest = reimbursementRequest,
    this.type = notificationType;

    this._variables = [
      {name: 'requesterFirstName', cb: this._getRequesterFirstName},
      {name: 'requesterLastName', cb: this._getRequesterLastName},
      {name: 'requesterFullName', cb: this._getRequesterFullName},
      {name: 'requesterKerberos', cb: this._getRequesterKerberos},
      {name: 'requesterLabel', cb: this._getRequesterLabel},
      {name: 'requesterOrganization', cb: this._getRequesterOrganization},
      {name: 'requesterBuisnessPurpose', cb: this._getRequesterBuisnessPurpose},
      {name: 'requesterLocation', cb: this._getRequesterLocation},
      {name: 'requesterProgramDate', cb: this._getRequesterProgramDate},
      {name: 'requesterTravelDate', cb: this._getRequesterTravelDate},
      {name: 'requesterComments', cb: this._getRequesterComments},
      {name: 'nextApproverFullName', cb: this._getNextApproverFullName},
      {name: 'nextApproverFundChanges', cb: this._getNextApproverFundChanges},
      {name: 'nextApproverKerberos', cb: this._getNextApproverKerberos},
      {name: 'reimbursementLabel', cb: this._getReimbursementLabel},
      {name: 'reimbursementEmployeeResidence', cb: this._getReimbursementEmployeeResidence},
      {name: 'reimbursementTravelDate', cb: this._getReimbursementTravelDate},
      {name: 'reimbursementPersonalTime', cb: this._getReimbursementPersonalTime},
      {name: 'reimbursementComments', cb: this._getReimbursementComments},
      {name: 'reimbursementStatus', cb: this._getReimbursementStatus},
      {name: 'approvalRequestUrl', cb: this._getApprovalRequestUrl},
      {name: 'reimbursementRequestUrl', cb: this._getReimbursementRequestUrl}
    ];
  }

/**
  * @description get the type of approvers needed
  * @returns approver list
*/
approvers(){
  if(this.type == "request" || this.type == "next-approver") return this.approvalRequest.approvalStatusActivity.filter(x => x.action == 'approval-needed');
  if(this.type == "request-cancel") return this.approvalRequest.approvalStatusActivity.filter(x => (x.action == 'approved') || (x.action == 'approved-with-changes'));

}
/**
  * @description requester first name
  * @returns requester first name
*/
_getRequesterFirstName(){
  return this.approvalRequest.employee.firstName;
}

/**
  * @description requester last name
  * @returns requester last name
*/
_getRequesterLastName(){
  return this.approvalRequest.employee.lastName;
}

/**
  * @description requester full name
  * @returns requester full name
*/
_getRequesterFullName(){
  return `${this._getRequesterFirstName()} ${this._getRequesterLastName()}`;
}

/**
  * @description requester kerberos
  * @returns requester kerberos
*/
_getRequesterKerberos(){
  return this.approvalRequest.employeeKerberos;
}

/**
  * @description requester label
  * @returns requester label
*/
_getRequesterLabel(){
  return this.approvalRequest.label;
}

/**
  * @description requester organization
  * @returns requester organization
*/
_getRequesterOrganization(){
  return this.approvalRequest.organization;
}

/**
  * @description requester buisness purpose
  * @returns requester buisness purpose
*/
_getRequesterBuisnessPurpose(){
  return this.approvalRequest.businessPurpose;
}

/**
  * @description requester location
  * @returns requester location
*/
_getRequesterLocation(){
  return this.approvalRequest.locationDetails;
}

/**
  * @description requester program date
  * @returns requester program date
*/
_getRequesterProgramDate(){
  return `${this.approvalRequest.programStartDate} - ${this.approvalRequest.programEndDate} `;
}

/**
  * @description requester travel date
  * @returns requester travel date
*/
_getRequesterTravelDate(){
  return `${this.approvalRequest.programStartDate} - ${this.approvalRequest.programEndDate} ` || 'Not Included';
}

/**
  * @description requester comments
  * @returns requester comments
*/
_getRequesterComments(){
  return this.approvalRequest.comments;
}

/**
  * @description next approver full name
  * @returns next approver full name
*/
_getNextApproverFullName(){
  let results = this.approvers();
  return `${results[0].employee.firstName} ${results[0].employee.lastName}`;
}

/**
  * @description next approver fund changes
  * @returns next approver fund changes
*/
_getNextApproverFundChanges(){
  let results = this.approvers();
  return results[0].fundChanges;
}

/**
  * @description next approver kerberos
  * @returns next approver kerberos
*/
_getNextApproverKerberos(){
  let results = this.approvers();
  return results[0].employeeKerberos;
}

/**
  * @description reimbursement label
  * @returns reimbursement label
*/
_getReimbursementLabel(){
  return this.reimbursementRequest.label;
}

/**
  * @description reimbursement employee residence
  * @returns reimbursement employee residence
*/
_getReimbursementEmployeeResidence(){
  return this.reimbursementRequest.employeeResidence;
}

/**
  * @description reimbursement travel date
  * @returns reimbursement travel date
*/
_getReimbursementTravelDate(){
  return `${this.reimbursementRequest.travelStart} - ${this.reimbursementRequest.travelEnd} ` || 'Not Included';
}

/**
  * @description reimbursement personal time
  * @returns reimbursement personal time
*/
_getReimbursementPersonalTime(){
  return this.reimbursementRequest.personalTime;
}

/**
  * @description reimbursement comments
  * @returns reimbursement comments
*/
_getReimbursementComments(){
  return this.reimbursementRequest.comments;
}

/**
  * @description reimbursement status
  * @returns reimbursement status
*/
_getReimbursementStatus(){
  return this.reimbursementRequest.status;
}

/**
  * @description approval request url
  * @returns approval request url
*/
_getApprovalRequestUrl(){
  return `${serverConfig.appRoot}/approval-request/${this.approvalRequest.approvalRequestId}`;
}

/**
  * @description reimbursement url
  * @returns  reimbursement url
*/
_getReimbursementRequestUrl(){
  return `${serverConfig.appRoot}/reimbursement-request/${this.reimbursementRequest.reimbursementRequestId}`;
}

/**
  * @description gets the request email
  * @returns email(s)
*/
async _getRequesterEmail(){
  let emp = {};

  emp.emp = await employee.getIamRecordById(this.approvalRequest.employeeKerberos);
  if ( emp.emp.error) {
    console.error('Error getting employee object', emp.emp.error);
    return null;
  }

  let email = emp.emp.res.email || null;
  return email;

}

/**
  * @description get next approver email
  * @returns email(s)
*/
async _getNextApproverEmail(){
  let emp = {};
  let results = this.approvers();

  let approver = results[0].employeeKerberos;

  if(!approver) return;

  emp.emp = await employee.getIamRecordById(approver);
  if ( emp.emp.error) {
    console.error('Error getting employee object', emp.emp.error);
    return null;
  }

  let email = emp.emp.res.email || null;
  return email;
}

/**
  * @description gets all approvers who have approved
  * @returns email(s)
*/
async _getAllApprovedEmail(){
  let emp = {};
  let emps = []; 
  let records = [];
  let results = this.approvers();

  results.map(r => records.push(r.employeeKerberos));

  emp.emp = await employee.getIamRecordById(records);


  if ( emp.emp.error) {
    console.error('Error getting employee object', emp.emp.error);
    return null;
  }

  emp.emp.res.map(e => emps.push(e.email));

  return emps;
}

/**
  * @description gets the HR Email
  * @returns email(s)
*/
async _getHrEmail(){
  let hrEmailObject = await settings._getEmail();


  if ( hrEmailObject.error ) {
    console.error('Error getting setting hrEmail object in POST /system-notification', hrEmailObject.error);
    return null;
  }

  return hrEmailObject;

}


/**
  * @description gets the content based on the type of email
  * @param {String} content content
  * @returns context
*/
_getContext(content){
  // get values from approvalRequest/reimbursmentRequest
  const context = {};

  for (let v of this._variables) {
    if(content.includes(v.name)) context[v.name] = v.cb.call(this);
  }

  return context;
}

/**
  * @description runs the hydration of the given email template
  * @param {String} content content
  * @returns hydrated email template
*/
  hydrate(content){
    const context = this._getContext(content);
    return this._evaluateTemplate(content, context);
  }

/**
  * @description hydrate evaluate template
  * @param {String} template retrieved template
  * @param {Object} context context given from content
  * @returns template
*/
  _evaluateTemplate(template, context) {
    const templateFunction = new Function(...Object.keys(context), `return \`${JSON.stringify(template)}\`;`);
    return templateFunction(...Object.values(context));
  }

/**
  * @description notification recipient for the email
  * @returns recipient
*/
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
         this.type == 'funded-hours'
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
 

