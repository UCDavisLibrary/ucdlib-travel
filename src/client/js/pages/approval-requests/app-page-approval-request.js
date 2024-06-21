import { LitElement } from 'lit';
import {render} from "./app-page-approval-request.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import urlUtils from "../../../../lib/utils/urlUtils.js";
import applicationOptions from '../../../../lib/utils/applicationOptions.js';

export default class AppPageApprovalRequest extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequestId : {type: Number},
      approvalRequest : {type: Object},
      queryObject: {type: Object},
      totalExpenditures: {type: Number},
      activity: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.approvalRequestId = 0;
    this.approvalRequest = {};
    this.activity = [];
    this.totalExpenditures = 0;

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'ApprovalRequestModel');
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
      this.ApprovalRequestModel.query(this.queryObject)
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
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
    this._setActivity(e.payload.data);
    this._setTotalExpenditures();

    this.showLoaded = true;
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
      action.actionObject = applicationOptions.approvalStatusActions.find(a => a.value === action.action);
    })
    activity.filter(action => !isNaN(action.occurredDate.getTime()) && action.actionObject);

    activity.sort((a, b) => {
      return a.occurredDate - b.occurredDate;
    });

    this.activity = activity;
    console.log(activity);
  }

  /**
   * @description Set the totalExpenditures property based on the expenditures array from the current approval request
   */
  _setTotalExpenditures(){
    let total = 0;
    if ( this.approvalRequest.expenditures ){
      this.approvalRequest.expenditures.forEach(e => {
        if ( !e.amount ) return;
        total += Number(e.amount);
      });
    }
    this.totalExpenditures = total;
  }

  _onStatusCommentsClick(e){
    const actionId = e.detail?.approvalRequestApprovalChainLinkId;
    if ( !actionId ) return;
    const actionEle = this.renderRoot.querySelector(`.action[action-id="${actionId}"]`);
    if ( !actionEle ) return;
    actionEle.scrollIntoView({behavior: 'smooth'});
  }

}

customElements.define('app-page-approval-request', AppPageApprovalRequest);
