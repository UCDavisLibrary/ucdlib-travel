import { LitElement } from 'lit';
import {render} from "./approval-request-header.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import typeTransform from '../../../lib/utils/typeTransform.js';
import applicationOptions from '../../../lib/utils/applicationOptions.js';

/**
 * @class ApprovalRequestHeader
 * @description Header component for a single approval request
 * Has basic information about the approval request and actions that can be taken by the user
 * @property {Object} approvalRequest - The approval request to display
 * @property {Array} availableActions - List of actions that can be taken on the approval request based on the user's role and the status of the request
 * @property {String} action - The action that is currently being processed
 */
export default class ApprovalRequestHeader extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequest: {type: Object},
      availableActions: {type: Array},
      hideActions: {type: Boolean, attribute: 'hide-actions'},
      action: {state: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.approvalRequest = {};
    this.availableActions = [];
    this.action = '';
    this.hideActions = false;

    this._injectModel('AuthModel', 'AppStateModel', 'ApprovalRequestModel');
  }

  /**
   * @description Lit lifecycle callback
   * @param {Map} props - Changed properties
   */
  willUpdate(props){
    if (props.has('approvalRequest')) {
      let actions = applicationOptions.getAvailableActions(this.approvalRequest, this.AuthModel.getToken().id);
      if ( this.approvalRequest.approvalStatus === 'recalled' ) {
        actions = [
          {value: 'redirect-to-form', label: 'Edit and Resubmit'},
          ...actions
        ];
      }
      this.availableActions = actions;
    }
  }

  /**
   * @description Get the program dates for the approval request
   * @returns {String}
   */
  getProgramDates(){
    return typeTransform.dateRangeFromIsoString(this.approvalRequest.programStartDate, this.approvalRequest.programEndDate);
  }

  /**
   * @description Event handler for action click
   * @param {Object} action - action object from applicationOptions.js
   */
  _onActionClick(action){
    if ( action.actor === 'approver' ){
      const loc = `${this.AppStateModel.store.breadcrumbs['approver'].link}/${this.approvalRequest.approvalRequestId}`
      this.AppStateModel.setLocation(loc);
      return;
    }
    if ( action.value === 'create-reimbursement' ){
      const loc = `${this.AppStateModel.store.breadcrumbs['reimbursement-new'].link}/${this.approvalRequest.approvalRequestId}`
      this.AppStateModel.setLocation(loc);
      return;
    }
    if ( action.value === 'redirect-to-form' || action.value === 'submit' ) {
      const loc = `${this.AppStateModel.store.breadcrumbs['approval-request-new'].link}/${this.approvalRequest.approvalRequestId}`
      this.AppStateModel.setLocation(loc);
      return;
    }
    this.AppStateModel.showDialogModal({
      title: `${action.label} this approval request?`,
      content: action.warningText || '',
      actions : [
        {text: 'Confirm', value: 'approval-request-submitter-action', color: 'primary'},
        {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
      ],
      data: {action}
    })
  }

  /**
   * @description Callback for dialog-action AppStateModel event
   * @param {Object} e - AppStateModel dialog-action event
   * @returns
   */
  _onDialogAction(e){
    if ( e.action !== 'approval-request-submitter-action' ) return;
    const action = e.data.action;
    this.action = action.value;
    this.ApprovalRequestModel.statusUpdate(this.approvalRequest.approvalRequestId, {action: action.value});
  }

  /**
   * @description Callback for approval-request-status-update event
   * Fires when the status of an approval request is updated (e.g. after the approval form action is processed by the server)
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onApprovalRequestStatusUpdate(e){
    if ( e.approvalRequestId !== this.approvalRequest.approvalRequestId ) return;
    if ( e.action?.action !== this.action ) return;
    const action = applicationOptions.approvalStatusActions.find(a => a.value === this.action);

    if ( e.state === 'error' ) {
      this.action = '';
      this.AppStateModel.showError('Error when performing action. Please try again.');
      return;
    }

    if ( e.state === 'loading' ){
      this.AppStateModel.showLoading();
      return;
    }

    this.action = '';
    this.AppStateModel.showToast({message: action.actionTakenText, type: 'success'});
    this.AppStateModel.refresh();
  }

}

customElements.define('approval-request-header', ApprovalRequestHeader);
