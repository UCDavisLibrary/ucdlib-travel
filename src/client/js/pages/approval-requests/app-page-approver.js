import { LitElement } from 'lit';
import {render} from "./app-page-approver.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import urlUtils from "../../../../lib/utils/urlUtils.js";


export default class AppPageApprover extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequestId : {type: Number},
      approvalRequest : {type: Object},
      queryObject: {type: Object},
      approvalRequestLink: {type: String},
      showLoaded: {type: Boolean}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'approval-requests';
    this.approvalRequest = {};
    this.approvalRequestLink = '';

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'SettingsModel', 'AuthModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.showLoaded = false;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Approve Request');

    this._setApprovalRequestId(state);
    if ( !this.approvalRequestId ) {
      this.AppStateModel.setLocation(this.AppStateModel.store.breadcrumbs['approver-landing'].link);
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

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      {text: 'Approval Request', link: this.approvalRequestLink},
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){

    const promises = [
      this.ApprovalRequestModel.query(this.queryObject),
      this.SettingsModel.getByCategory(this.settingsCategory)
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  /**
   * @description Callback for approval-requests-requested event
   * Fires when the approval request for the current approvalRequestId is fetched
   * @param {*} e
   * @returns
   */
  _onApprovalRequestsRequested(e){
    if ( e.state !== 'loaded' ) return;

    // check that request was issue by this element
    if ( !this.AppStateModel.isActivePage(this) ) return;
    const elementQueryString = urlUtils.queryObjectToKebabString(this.queryObject);
    if ( e.query !== elementQueryString ) return;

    if ( !e.payload.total ){
      this.AppStateModel.showError('This approval request does not exist.');
      return;
    }

    const approvalRequest = e.payload.data[0];
    if ( !['submitted', 'in-progress'].includes(approvalRequest.approvalStatus) ) {
      this.AppStateModel.setLocation(this.approvalRequestLink);
      return;
    }

    const userAction = approvalRequest.approvalStatusActivity.find(a => a.employeeKerberos === this.AuthModel.getToken().id);
    if ( !userAction ) {
      this.AppStateModel.showError('You are not authorized to approve this request.');
      return;
    }

    this.isNextApprover =
      userAction.action === 'approval-needed' &&
      !approvalRequest.approvalStatusActivity.find(a =>
        a.action === 'approval-needed' &&
        a.employeeKerberos !== this.AuthModel.getToken().id && a.approverOrder < userAction.approverOrder
      );
    this.approvalRequest = approvalRequest;
    this.showLoaded = true;
  }

  /**
   * @description Set approvalRequestId property from App State location (the url)
   * @param {Object} state - AppStateModel state
   */
  _setApprovalRequestId(state) {
    let approvalRequestId = Number(state?.location?.path?.[2]);
    this.approvalRequestId = Number.isInteger(approvalRequestId) && approvalRequestId > 0 ? approvalRequestId : 0;
    this.queryObject = {requestIds: this.approvalRequestId, isCurrent: true};
    this.approvalRequestLink = `/approval-request/${this.approvalRequestId}`;
  }


}

customElements.define('app-page-approver', AppPageApprover);
