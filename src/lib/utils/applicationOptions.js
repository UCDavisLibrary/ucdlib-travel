/**
 * @class ApplicationOptions
 * @description Contains keywords and values for application options - e.g. table columns, statuses, etc.
 */
class ApplicationOptions {

  /**
   * @description - get approval status options
   * @returns {Array} - Array of objects containing the options for the approval-status column in the approval-request table
   * Contains the following values:
   * - value: the keyword value of the status
   * - label: the label to display in the UI
   * - isFinal: boolean indicating whether the status is a final status for the approval request (i.e. no further actions can be taken on the request)
   */
  get approvalStatuses(){
    return [
      {value: 'draft', label: 'Draft'},
      {value: 'submitted', label: 'Submitted'},
      {value: 'in-progress', label: 'In Progress'},
      {value: 'approved', label: 'Approved'},
      {value: 'canceled', label: 'Canceled', isFinal: true},
      {value: 'denied', label: 'Denied', isFinal: true},
      {value: 'revision-requested', label: 'Revision Requested'}
    ];
  }

  /**
   * @description - get reimbursement status options
   * @returns {Array} - Array of objects containing the options for the reimbursement-status column in the approval-request table
   * Contains the following values:
   * - value: the keyword value of the status
   * - label: the label to display in the UI
   */
  get reimbursementStatuses(){
    return [
      {value: 'not-required', label: 'Not Required'},
      {value: 'not-submitted', label: 'Not Submitted'},
      {value: 'reimbursment-pending', label: 'Reimbursement Pending'},
      {value: 'partially-reimbursed', label: 'Partially Reimbursed'},
      {value: 'fully-reimbursed', label: 'Fully Reimbursed'}
    ];
  }

  /**
   * @description - get approval status actions
   * @returns {Array} - Array of objects containing the options for actions that can be taken on an approval request
   * Contains the following values:
   * - value: the keyword value of the action
   * - label: the label to display in the UI
   * - actor: the role of the user who can take the action
   * - resultingStatus: the status that the approval request will be set to after the action is taken
   */
  get approvalStatusActions(){
    return [
      {
        value: 'approve',
        label: 'Approve',
        actor: 'approver',
        resultingStatus: ['in-progress', 'approved'],
        actionTakenText: 'Approval request approved.'
      },
      {
        value: 'approve-with-changes',
        label: 'Approve with Changes',
        actor: 'approver',
        resultingStatus: ['in-progress', 'approved'],
        actionTakenText: 'Approval request approved with changes to funding sources.'
      },
      {
        value: 'deny',
        label: 'Deny',
        actor: 'approver',
        resultingStatus: 'denied',
        actionTakenText: 'Approval request denied.'
      },
      {
        value: 'cancel',
        label: 'Cancel',
        actor: 'submitter',
        resultingStatus: 'canceled',
        actionTakenText: 'Approval request canceled.'
      },
      {
        value: 'request-revision',
        label: 'Request Revision',
        actor: 'approver',
        resultingStatus: 'revision-requested',
        actionTakenText: 'Revisions requested'
      },
      {
        value: 'submit',
        label: 'Submit',
        actor: 'submitter',
        resultingStatus: 'submitted',
        actionTakenText: 'Approval request submitted.'
      }
    ];
  }

  /**
   * @description - Get the label for an approval status action
   * @param {String} action - The action keyword
   * @returns
   */
  approvalStatusActionLabel(action){
    return this.approvalStatusActions.find(a => a.value === action)?.label || '';
  }

  /**
   * @description - Get the resulting status of an approval request after an action is taken
   * @param {String} actionValue - The action keyword
   * @param {Object} approvalRequest - The approval request object
   * @returns {String}
   */
  getResultingStatus(actionValue, approvalRequest){
    const action = this.approvalStatusActions.find(a => a.value === actionValue);
    if ( !action ) return '';
    if ( typeof action.resultingStatus === 'string' ) return action.resultingStatus;

    if ( ['approve', 'approve-with-changes'].includes(action.value) ){
      return approvalRequest.approvalStatusActivity.filter(a => a.action === 'approval-needed').length === 1 ? 'approved' : 'in-progress';
    }

    return "";
  }

  getAvailableActions(approvalRequest, userKerberos){
    const actions = [];
    if ( !approvalRequest || !userKerberos ) return actions;

    const isSubmitter = approvalRequest.employeeKerberos === userKerberos;

    if ( isSubmitter ){

      if ( approvalRequest.approvalStatus === 'draft' ){
        this._pushAction(actions, 'submit');
        return actions;
      }
      if ( approvalRequest.approvalStatus === 'revision-requested' ){
        const submitAction = this.approvalStatusActions.find(a => a.value === 'submit');
        submitAction.label = 'Edit and Resubmit';
        actions.push(submitAction);
      }
      if ( ['not-required', 'not-submitted'].includes(approvalRequest.reimbursementStatus) ){
        this._pushAction(actions, 'cancel');
      }
    }

    if ( this.isNextApprover(approvalRequest, userKerberos) ){
      if ( approvalRequest.approvalStatus === 'draft' ) return actions;
      this._pushAction(actions, 'approve');
      this._pushAction(actions, 'request-revision');
      this._pushAction(actions, 'deny');
    }

    return actions;
  }

  /**
   * @description - Add an approval status action to an array by keyword value
   * @param {Array} arr - The array to add the action to
   * @param {String} actionValue - The keyword value of the action to add
   * @returns {null}
   */
  _pushAction(arr, actionValue){
    const action = this.approvalStatusActions.find(a => a.value === actionValue);
    if ( !action ) return;
    if ( !arr.find(a => a.value === actionValue)) {
      arr.push(action);
    }
  }

  /**
   * @description - Check if a user is the next approver for an approval request
   * @param {Object} approvalRequest - The approval request object
   * @param {String} userKerberos - The kerberos of the user
   * @returns {Boolean}
   */
  isNextApprover(approvalRequest, userKerberos){
    if ( !approvalRequest || !userKerberos ) return false;

    const nextApprover = approvalRequest.approvalStatusActivity.find(a => a.action === 'approval-needed');
    return nextApprover && nextApprover.approverKerberos === userKerberos;
  }


}

export default new ApplicationOptions();
