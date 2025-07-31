import { LitElement } from 'lit';
import {render} from "./app-page-approval-request.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import { appConfig } from '../../../../lib/appGlobals.js';
import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';
import reimbursementExpenses from '../../../../lib/utils/reimbursementExpenses.js';
import payload from '../../../../lib/cork/payload.js';

/**
 * @class AppPageApprovalRequest
 * @description Page for displaying a single approval request
 * @property {Number} approvalRequestId - The id of the approval request to display - set from url
 * @property {Object} approvalRequest - The approval request to display - set from ApprovalRequestModel
 * @property {Object} queryObject - Query object for fetching approval request data
 * @property {Number} totalReimbursementRequested - Total amount of reimbursement requested for this approval request
 * @property {Array} activity - Array of approvalStatusActivity objects for all of the revisions of this approval request
 * @property {Array} reimbursementRequests - Array of reimbursement requests for this approval request
 */
export default class AppPageApprovalRequest extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequestId : {type: Number},
      approvalRequest : {type: Object},
      queryObject: {type: Object},
      totalReimbursementRequested: {type: Number},
      activity: {type: Array},
      reimbursementRequests: {type: Array},
      approvedExpenseTotal: {state: true},
      hasApprovedExpenses: {state: true},
      reimbursementRequestTotal: {state: true},
      _hideReimbursementSection: {state: true},
      _showReimbursementStatusWarning: {state: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.approvalRequestId = 0;
    this.approvalRequest = {};
    this.activity = [];
    this._hideReimbursementSection = false;
    this.approvedExpenseTotal = '0.00';
    this.hasApprovedExpenses = false;
    this.reimbursementRequestTotal = '0.00';
    this.reimbursementRequests = [];
    this._showReimbursementStatusWarning = false;
    this._showNotification = true;

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'ReimbursementRequestModel', 'SettingsModel', 'NotificationModel');
  }

  willUpdate(props){
    if ( props.has('approvedExpenseTotal') ){
      this.hasApprovedExpenses = Number(this.approvedExpenseTotal) > 0;
    }
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this._showLoaded = false;
    this.notifications = [];
    this._showNotification = false;

    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle({show: false});
    this.AppStateModel.setBreadcrumbs({show: false});

    this._setApprovalRequestId(state);
    if ( !this.approvalRequestId ) {
      this.AppStateModel.setLocation(this.AppStateModel.store.breadcrumbs['approval-requests'].link);
      return;
    }

    const d = await this.getPageData();
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if ( hasError ) {
      this.AppStateModel.showError(d, {ele: this});
      return;
    }

    // bail if a callback redirected us
    const _showLoaded = await this.waitController.waitForHostPropertyValue('_showLoaded', true, 2000);
    if ( _showLoaded.wasTimeout ) return;

    this.AppStateModel.showLoaded(this.id);

    this.requestUpdate();
  }

  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){
    const reimbursementQuery = {
      approvalRequestIds: [this.approvalRequestId],
      isCurrent: true,
      pageSize: -1,
      includeReimbursedTotal: true
    };

    const promises = [
      this.ApprovalRequestModel.query(this.queryObject),
      this.ReimbursementRequestModel.query(reimbursementQuery),
      this.SettingsModel.getByCategory('approval-requests'),
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  _onReimbursementRequestRequested(e){
    if ( e.state !== 'loaded' ) return;
    if ( !this.AppStateModel.isActivePage(this) ) return;

    this.reimbursementRequests = e.payload.data;

    let reimbursementRequestTotal = 0;
    for (const r of e.payload.data) {
      reimbursementRequestTotal += Number(reimbursementExpenses.addExpenses(r.expenses));
    }
    this.reimbursementRequestTotal = reimbursementRequestTotal.toFixed(2);
    this._setShowReimbursementStatusWarning();
  }

  /**
   * @description Bound to action button click event in reimbursement status warning message
   */
  _onReimbursementWarningClick(){
    this.ApprovalRequestModel.moreReimbursementToggle(this.approvalRequestId);
  }

  // _onNotificationHistory(e){

  // }

  
    /**
   * @description Event handler for when show notification link is clicked the modal will show message
   */
  async _onActivityClick(activity){
    let apRevisionId = this.approvalRequest.approvalRequestRevisionId;

    const notificationQuery = {
      approvalRequestIds: apRevisionId
    };

    const res = await this.NotificationModel.getNotificationHistory(notificationQuery)

    if(res.state == 'error') {
      this.notifications = [];

      this.AppStateModel.showDialogModal({
        title : `No Notification Access`,
        content : `You can not view this notification because either you do not have 
                   access to this message or the request is not available for viewing.`,
        actions : [
          {text: 'Close', value: 'cancel', invert: true, color: 'primary'}
        ],
        data : {}
      });

      this.requestUpdate();

      return;
    }

    if ( res.state !== 'loaded' ) return;

    this.notifications = res.payload.data;

    const validTypes = {
      'request': 'request-notification',
      'next-approver': 'approver-notification',
      'reimbursement': 'reimbursement-notification'
    };

    let notifyComment = this.notifications.find(not => {
      const expectedAction = validTypes[not.notificationType];

      return (
        apRevisionId == not.approvalRequestRevisionId &&
        activity.employeeKerberos === not.employeeKerberos &&
        activity.action === expectedAction
      );
    });

    if (Array.isArray(notifyComment)) {
      notifyComment = notifyComment[0];
    }

    let subject, details, date, comment;

    subject = notifyComment?.subject ? notifyComment.subject : "Subject Not Included";
    details = notifyComment?.details;
    date = new Date(notifyComment.createdAt).toLocaleDateString('en-US')

    comment = `
      <b>To:</b> ${details?.to ? details.to : "Recipient Not Included"}<br>
      <b>From:</b> ${details?.from ? details.from : "Sender Not Included"}<br>
      <b>Date:</b> ${date ? date: "No Date Included"}<br><br>
      <pre style="font-family: inherit;">${details.body ? details.body: "No Notification Body Included"}</pre><br><br>
      ${notifyComment?.emailSent ? `<b>This Email was sent</b>`:`<b>This Email was NOT sent</b>`}
    `;

    this.AppStateModel.showDialogModal({
      title : `${subject}`,
      content : `${comment}`,
      actions : [
        {text: 'Close', value: 'cancel', invert: true, color: 'primary'}
      ],
      data : {}
    });

    this.requestUpdate();

  }

  /**
   * @description bound to ApprovalRequestModel approval-request-more-reimbursement-toggle-update event
   * Fires when the more reimbursement flag is toggled for this approval request
   * @param {*} e
   * @returns
   */
  _onApprovalRequestMoreReimbursementToggleUpdate(e){
    const ido = {approvalRequestId: this.approvalRequestId};
    const id = payload.getKey(ido);
    if ( e.id !== id ) return;
    if ( e.state === 'loaded' ) {
      this.AppStateModel.showToast({message: 'Reimbursement status updated', type: 'success'});
      this.AppStateModel.refresh();
    } else if ( e.state === 'error' ) {
      this.AppStateModel.showError(e)
    }
  }

  _setShowReimbursementStatusWarning(){
    const allReimbursed = this.reimbursementRequests.every(r => r.status === 'fully-reimbursed');
    const overallStatusPartial = this.approvalRequest?.reimbursementStatus	=== 'partially-reimbursed';
    const expectMoreReimbursement = this.approvalRequest?.expectMoreReimbursement ? true : false;
    this._showReimbursementStatusWarning = allReimbursed && overallStatusPartial && expectMoreReimbursement;
  }

  /**
   * @description Get the approvalStatusActivity array for the current approval request,
   * excluding actions that are not relevant to the current status
   * @returns {Array}
   */
  getApprovalStatusActivity(){
    return (this.approvalRequest.approvalStatusActivity || []).filter(a => {
      if ( ['in-progress', 'submitted', 'approved'].includes(this.approvalRequest?.approvalStatus) ) return true;
      return a.action !== 'approval-needed';
    });
  }

  /**
   * @description Set approvalRequestId property from App State location (the url)
   * @param {Object} state - AppStateModel state
   */
  _setApprovalRequestId(state) {
    let approvalRequestId = Number(state?.location?.path?.[1]);
    this.approvalRequestId = Number.isInteger(approvalRequestId) && approvalRequestId > 0 ? approvalRequestId : 0;
    this.queryObject = {requestIds: this.approvalRequestId, pageSize: -1};
  }

  /**
   * @description bound to ApprovalRequestModel approval-requests-requested event
   * Fires after approval request data is requested
   * @param {Object} e - cork-app-utils event
   * @returns
   */
  _onApprovalRequestsRequested(e){
    if ( e.state !== 'loaded' ) return;

    // check that request was issue by this element
    if ( !this.AppStateModel.isActivePage(this) ) return;

    if ( !e.payload.total ){
      this.AppStateModel.showError('Approval Request not found');
      return;
    }

    const approvalRequest = e.payload.data.find(r => r.isCurrent);
    if ( !approvalRequest ) {
      this.AppStateModel.showError('Approval Request not found');
      return;
    }

    if ( approvalRequest.approvalStatus === 'draft' ) {
      this.AppStateModel.setLocation(`${this.AppStateModel.store.breadcrumbs['approval-request-new'].link}/${this.approvalRequestId}`);
      return;
    }

    this.approvalRequest = approvalRequest;
    this.approvedExpenseTotal = reimbursementExpenses.addExpenses(approvalRequest.expenditures || []);
    this._setReimbursementSectionVisibility();
    this._setActivity(e.payload.data);
    this._setShowReimbursementStatusWarning();

    this._showLoaded = true;
  }

  _setReimbursementSectionVisibility(){
    if ( !appConfig.featureFlags.reimbursementRequest ) {
      this._hideReimbursementSection = true;
      return;
    }

    if ( this.approvalRequest.reimbursementStatus === 'not-required' ) {
      this._hideReimbursementSection = true;
      return;
    }

    if ( this.approvalRequest.approvalStatus !== 'approved' ) {
      this._hideReimbursementSection = true;
      return;
    }

    this._hideReimbursementSection = false;
  }

  /**
   * @description Set this.activity property with approver activity for all versions of the approval request
   * @param {Array} approvalRequests - All approval request versions for the current approvalRequestId
   * @returns {Array}
   */
  async _setActivity(approvalRequests){
    let activity = [];
    approvalRequests.forEach(r => {
      r.approvalStatusActivity.forEach(action => {
        if ( action.action === 'approval-needed' ) return;
        action = {...action};
        activity.push(action);
      });
    });

    activity.forEach(action => {
      action.occurredDate = new Date(action.occurred.endsWith('Z') ? action.occurred : action.occurred + 'Z');
      action.occurredDateString = action.occurredDate.toLocaleDateString();
      action.occurredTimeString = action.occurredDate.toLocaleTimeString();
      if (action.reimbursementRequestId ){
        action.actionObject = applicationOptions.approvalRequestReimbursementActivity.find(a => a.value === action.action);
      } else if(action.action.includes("notification")){
        action.actionObject = applicationOptions.approvalRequestActivity.find(a => a.value === action.action);
      } else {
        action.actionObject = applicationOptions.approvalStatusActions.find(a => a.value === action.action);
      }

    })
    activity = activity.filter(action => !isNaN(action.occurredDate.getTime()) && action.actionObject);

    activity.sort((a, b) => {
      return a.occurredDate - b.occurredDate;
    });

    // a silly hack to make sure font awesome icons are displayed correctly
    // since fa changes dom outside of lit-html, we need to make sure the icon gets updated
    // couldnt get the live lit directive to work
    this.activity = [];
    await this.waitController.waitForUpdate();

    this.activity = activity;
  }

  /**
   * @description Bound to view-comments event from approval-request-status-action component
   * @param {CustomEvent} e - e.detail.approvalRequestApprovalChainLinkId is the id of the action to scroll to
   * @returns
   */
  _onStatusCommentsClick(e){
    const actionId = e.detail?.approvalRequestApprovalChainLinkId;
    if ( !actionId ) return;
    const actionEle = this.renderRoot.querySelector(`.action[action-id="${actionId}"]`);
    if ( !actionEle ) return;
    actionEle.scrollIntoView({behavior: 'smooth'});
  }

}

customElements.define('app-page-approval-request', AppPageApprovalRequest);
