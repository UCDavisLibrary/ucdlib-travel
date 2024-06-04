import { LitElement } from 'lit';
import {render } from "./app-page-approval-request-confirm.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import urlUtils from "../../../../lib/utils/urlUtils.js";

export default class AppPageApprovalRequestConfirm extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequestId : {type: Number},
      approvalRequest : {type: Object},
      approvalChain : {type: Array},

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.approvalRequestId = 0;
    this.approvalRequest = {};
    this.approvalChain = [];
    this.settingsCategory = 'approval-requests';

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'SettingsModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Submit Approval Request');

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

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs['approval-requests'],
      {text: 'New', 'link': `${this.AppStateModel.store.breadcrumbs['approval-request-new'].link}/${this.approvalRequestId}`},
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    this.AppStateModel.showLoaded(this.id);

    this.requestUpdate();
  }


  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){

    const promises = [
      this.ApprovalRequestModel.query({requestIds: this.approvalRequestId, isCurrent: true}),
      this.ApprovalRequestModel.getApprovalChain(this.approvalRequestId),
      this.SettingsModel.getByCategory(this.settingsCategory)
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  _onApprovalRequestChainFetched(e) {
    if ( e.state !== 'loaded' ) return;
    if ( e.approvalRequestId !== this.approvalRequestId ) return;
    this.approvalChain = e.payload;
    console.log(e);
  }

  _onApprovalRequestsRequested(e){
    if ( e.state !== 'loaded' ) return;

    // check that request was issue by this element
    const elementQueryString = urlUtils.queryObjectToKebabString({requestIds: this.approvalRequestId, isCurrent: true});
    if ( e.query !== elementQueryString ) return;

    if ( !e.payload.total ){
      this.resetForm();
      setTimeout(() => {
        this.AppStateModel.showError('This approval request does not exist.');
      }, 100);
      return;
    }

    // check that confirmation view is appropriate for this request
    const approvalRequest = e.payload.data[0];
    if ( approvalRequest.approvalStatus !== 'draft' ) {
      this.AppStateModel.setLocation(this.AppStateModel.store.breadcrumbs['approval-requests'].link);
      return;
    }

    if ( !approvalRequest.validatedSuccessfully ){
      this.AppStateModel.setLocation(`${this.AppStateModel.store.breadcrumbs['approval-request-new'].link}/${this.approvalRequestId}`);
      return;
    }

    this.approvalRequest = approvalRequest;
    console.log(approvalRequest);
  }


  /**
   * @description Set approvalRequestId property from App State location (the url)
   * @param {Object} state - AppStateModel state
   */
  _setApprovalRequestId(state) {
    let approvalRequestId = Number(state?.location?.path?.[2]);
    this.approvalRequestId = Number.isInteger(approvalRequestId) && approvalRequestId > 0 ? approvalRequestId : 0;
  }

}

customElements.define('app-page-approval-request-confirm', AppPageApprovalRequestConfirm);
