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
   * - isActive: boolean indicating whether the status is an active status for the approval request (i.e. actions can be taken on the request)
   */
  get approvalStatuses(){
    return [
      {
        value: 'draft',
        label: 'Draft'
      },
      {
        value: 'submitted',
        label: 'Submitted',
        isActive: true
      },
      {
        value: 'in-progress',
        label: 'In Progress',
        isActive: true
      },
      {
        value: 'approved',
        label: 'Approved'
      },
      {
        value: 'canceled',
        label: 'Canceled',
        isFinal: true
      },
      {
        value: 'denied',
        label: 'Denied',
        isFinal: true
      },
      {
        value: 'revision-requested',
        label: 'Revision Requested',
        isActive: true
      },
      {
        value: 'recalled',
        label: 'Recalled',
        isActive: true
      }
    ];
  }

  /**
   * @description - get reimbursement status options
   * @returns {Array} - Array of objects containing the options for the reimbursement-status column in the approval-request table
   * Contains the following values:
   * - value: the keyword value of the status
   * - label: the label to display in the UI
   * - isActive: the approval request is in an active state
   */
  get reimbursementStatuses(){
    return [
      {
        value: 'not-required',
        label: 'Reimbursement Not Required',
        iconClass: 'fa-solid fa-ban',
        brandColor: 'pinot'
      },
      {
        value: 'not-submitted',
        label: 'Reimbursement Not Submitted',
        isActive: true,
        iconClass: 'fa-solid fa-ban',
        brandColor: 'pinot'
      },
      {
        value: 'submitted',
        label: 'Reimbursement Request Submitted',
        isActive: true,
        iconClass: 'fa-solid fa-upload',
        brandColor: 'putah-creek'
      },
      {
        value: 'reimbursement-pending',
        label: 'Reimbursement Pending',
        isActive: true,
        iconClass: 'fa-solid fa-circle-half-stroke',
        brandColor: 'secondary'
      },
      {
        value: 'partially-reimbursed',
        label: 'Partially Reimbursed',
        isActive: true,
        iconClass: 'fa-solid fa-circle-half-stroke',
        brandColor: 'secondary'
      },
      {
        value: 'fully-reimbursed',
        label: 'Fully Reimbursed',
        iconClass: 'fa-solid fa-check',
        brandColor: 'redwood'
      }
    ];
  }

  /**
   * @description - get status options for a single reimbursement request
   * @returns {Array} - Array of objects containing the options for the status column in the reimbursement_request table
   */
  get reimbursementRequestStatuses(){
    const exclude = ['not-required', 'not-submitted'];
    return this.reimbursementStatuses.filter(s => !exclude.includes(s.value));
  }

  /**
   * @description - get approval status actions
   * @returns {Array} - Array of objects containing the options for actions that can be taken on an approval request
   * Contains the following values:
   * - value: the keyword value of the action
   * - label: the label to display in the UI
   * - actor: the role of the user who can take the action
   * - resultingStatus: the status that the approval request will be set to after the action is taken
   * - actionTakenText: the text to display in the UI after the action is taken
   * - byLine: the text to display in the UI indicating who took the action
   * - iconClass: the class of the icon to display in the UI
   * - brandColor: the color of the icon to display in the UI
   */
  get approvalStatusActions(){
    return [
      {
        value: 'approve',
        label: 'Approve',
        actor: 'approver',
        resultingStatus: ['in-progress', 'approved'],
        actionTakenText: 'Approval request approved.',
        byLine: 'Approved By:',
        iconClass: 'fa-solid fa-thumbs-up',
        brandColor: 'redwood'
      },
      {
        value: 'approve-with-changes',
        label: 'Approve with Changes',
        actor: 'approver',
        resultingStatus: ['in-progress', 'approved'],
        actionTakenText: 'Approval request approved with changes to funding sources.',
        byLine: 'Approved With Changes By:',
        iconClass: 'fa-solid fa-thumbs-up',
        brandColor: 'redwood'
      },
      {
        value: 'deny',
        label: 'Deny',
        actor: 'approver',
        resultingStatus: 'denied',
        actionTakenText: 'Approval request denied.',
        byLine: 'Denied By:',
        iconClass: 'fa-solid fa-ban',
        brandColor: 'double-decker'
      },
      {
        value: 'cancel',
        label: 'Cancel',
        actor: 'submitter',
        resultingStatus: 'canceled',
        actionTakenText: 'Approval request canceled.',
        byLine: 'Canceled By:',
        iconClass: 'fa-solid fa-times',
        brandColor: 'redbud',
        warningText: `
          This action cannot be undone.
          If you cancel this request, it will be permanently removed from the approval process.
          If you need to make changes to the request, please recall and then resubmit it instead.
          `
      },
      {
        value: 'request-revision',
        label: 'Request Revision',
        actor: 'approver',
        resultingStatus: 'revision-requested',
        actionTakenText: 'Revisions requested.',
        byLine: 'Revision Requested By:',
        iconClass: 'fa-solid fa-edit',
        brandColor: 'pinot'
      },
      {
        value: 'submit',
        label: 'Submit',
        actor: 'submitter',
        resultingStatus: 'submitted',
        actionTakenText: 'Approval request submitted.',
        byLine: 'Submitted By:',
        iconClass: 'fa-solid fa-upload',
        brandColor: 'putah-creek'
      },
      {
        value: 'recall',
        label: 'Recall',
        actor: 'submitter',
        resultingStatus: 'recalled',
        actionTakenText: 'Approval request recalled.',
        byLine: 'Recalled By:',
        iconClass: 'fa-solid fa-rotate-left',
        brandColor: 'secondary',
        warningText: `Recalling this request will revoke all approvals, return the request to 'draft' status, and require you to resubmit.`
      }
    ];
  }

  get approvalRequestReimbursementActivity(){
    return [
      {
        value: 'reimbursement-request-submitted',
        label: 'Submitted',
        actionTakenText: 'Reimbursement request submitted.',
        byLine: 'Submitted By:',
        iconClass: 'fa-solid fa-money-bill-wave',
        brandColor: 'putah-creek'
      },
      {
        value: 'reimbursement-transaction-added',
        label: 'Reimbursement Transaction Added',
        actionTakenText: 'Reimbursement transaction added.',
        byLine: 'Added By:',
        iconClass: 'fa-solid fa-money-bill-transfer',
        brandColor: 'pinot'
      },
      {
        value: 'reimbursement-transaction-updated',
        label: 'Reimbursement Transaction Updated',
        actionTakenText: 'Reimbursement transaction updated.',
        byLine: 'Updated By:',
        iconClass: 'fa-solid fa-money-bill-transfer',
        brandColor: 'pinot'
      }
    ]
  }

  get reimbursementTransactionStatuses(){
    return [
      {
        value: 'submitted',
        labelShort: 'Submitted',
        label: 'Submitted To Aggie Expense'
      },
      {
        value: 'partially-reimbursed',
        labelShort: 'Partial Reimbursement',
        label: 'Transaction Partially Reimbursed'
      },
      {
        value: 'fully-reimbursed',
        labelShort: 'Fully Reimbursed',
        label: 'Transaction Fully Reimbursed'
      },
      {
        value: 'cancelled',
        labelShort: 'Cancelled',
        label: 'Transaction Cancelled'
      }
    ];
  }

  /**
   * @description - Get the label for an approval status action
   * @param {String} action - The action keyword
   * @returns {String}
   */
  approvalStatusActionLabel(action){
    return this.approvalStatusActions.find(a => a.value === action)?.label || '';
  }

  /**
   * @description - Get the label for an approval status
   * @param {String} status - The status keyword
   * @returns {String}
   */
  approvalStatusLabel(status){
    return this.approvalStatuses.find(s => s.value === status)?.label || '';
  }

  /**
   * @description - Get the label for an reimbursement status
   * @param {String} status - The status keyword
   * @param {String} entity - The entity type - 'approvalRequest' or 'reimbursementRequest'
   * @returns {String}
   */
  reimbursementStatusLabel(status, entity='approvalRequest'){
    if ( entity === 'approvalRequest' ){
      return this.reimbursementStatuses.find(s => s.value === status)?.label || '';
    }
    if ( entity === 'reimbursementRequest' ){
      return this.reimbursementRequestStatuses.find(s => s.value === status)?.label || '';
    }

    return '';
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

      const noReimbursementActivity = ['not-required', 'not-submitted'].includes(approvalRequest.reimbursementStatus)

      if ( approvalRequest.approvalStatus === 'draft' ){
        this._pushAction(actions, 'submit');
        return actions;
      }

      if ( approvalRequest.approvalStatus === 'revision-requested' ){
        const submitAction = this.approvalStatusActions.find(a => a.value === 'submit');
        submitAction.label = 'Edit and Resubmit';
        actions.push(submitAction);
      } else if ( noReimbursementActivity && !['canceled', 'recalled'].includes(approvalRequest.approvalStatus) ){
        this._pushAction(actions, 'recall');
      }


      if ( noReimbursementActivity && approvalRequest.approvalStatus !== 'canceled'){
        this._pushAction(actions, 'cancel');
      }

      if (
        approvalRequest.approvalStatus === 'approved' &&
        !['fully-reimbursed', 'not-required'].includes(approvalRequest.reimbursementStatus)
      ){
        actions.push({
          value: 'create-reimbursement',
          label: 'Submit a Reimbursement Request'
        })
      }
    }

    if ( this.isNextApprover(approvalRequest, userKerberos) ){
      if ( ['in-progress', 'submitted'].includes(approvalRequest.approvalStatus) ){
        this._pushAction(actions, 'approve');
        this._pushAction(actions, 'request-revision');
        this._pushAction(actions, 'deny');
      }
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

    const nextApprover = (approvalRequest.approvalStatusActivity || []).find(a => a.action === 'approval-needed');
    return nextApprover && nextApprover.employeeKerberos === userKerberos;
  }


}

export default new ApplicationOptions();
