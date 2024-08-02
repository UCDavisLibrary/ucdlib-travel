import { LitElement } from 'lit';
import {render} from "./app-page-approval-request.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';
import reimbursmentExpenses from '../../../../lib/utils/reimbursmentExpenses.js';

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
      reimbursmentRequestTotal: {state: true},
      _hideReimbursementSection: {state: true}
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
    this.reimbursmentRequestTotal = '0.00';
    this.reimbursementRequests = [];

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'ReimbursementRequestModel');
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
    this.showLoaded = false;
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
      this.AppStateModel.showError(d);
      return;
    }

    // bail if a callback redirected us
    await this.waitController.wait(50);
    state = await this.AppStateModel.get();
    if ( this.id !== state.page || !this.showLoaded ) return;

    this.AppStateModel.showLoaded(this.id);

    this.requestUpdate();
  }

  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){

    const promises = [
      this.ApprovalRequestModel.query(this.queryObject),
      this.ReimbursementRequestModel.query({approvalRequestIds: [this.approvalRequestId], isCurrent: true, pageSize: -1})
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  _onReimbursementRequestRequested(e){
    if ( e.state !== 'loaded' ) return;
    if ( !this.AppStateModel.isActivePage(this) ) return;

    this.reimbursementRequests = e.payload.data;

    let reimbursmentRequestTotal = 0;
    for (const r of e.payload.data) {
      reimbursmentRequestTotal += Number(reimbursmentExpenses.addExpenses(r.expenses));
    }
    this.reimbursmentRequestTotal = reimbursmentRequestTotal.toFixed(2);
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
    this.approvedExpenseTotal = reimbursmentExpenses.addExpenses(approvalRequest.expenditures || []);
    this._setReimbursementSectionVisibility();
    this._setActivity(e.payload.data);

    this.showLoaded = true;
  }

  _setReimbursementSectionVisibility(){
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
  _setActivity(approvalRequests){
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
      } else {
        action.actionObject = applicationOptions.approvalStatusActions.find(a => a.value === action.action);
      }

    })
    activity = activity.filter(action => !isNaN(action.occurredDate.getTime()) && action.actionObject);

    activity.sort((a, b) => {
      return a.occurredDate - b.occurredDate;
    });

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
