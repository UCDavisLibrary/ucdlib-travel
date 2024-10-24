import { LitElement } from 'lit';
import {render } from "./app-page-approval-request-confirm.tpl.js";
import { createRef } from 'lit/directives/ref.js';
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import urlUtils from "../../../../lib/utils/urlUtils.js";

/**
 * @class AppPageApprovalRequestConfirm
 * @description Page component for confirming an approval request before submitting
 * @property {Number} approvalRequestId - the id of the approval request to confirm - set from url
 * @property {Object} approvalRequest - the approval request to confirm - set from ApprovalRequestModel based on approvalRequestId
 * @property {Array} approvalChain - the approval chain for the approval request - set from ApprovalRequestModel based on approvalRequestId
 * @property {String} formLink - the link to the approval request form for this request
 * @property {Number} totalExpenditures - the total amount of expenditures for this approval request - calculated from approvalRequest.expenditures
 * @property {Object} queryObject - query for fetching data for this approval request
 */
export default class AppPageApprovalRequestConfirm extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequestId : {type: Number},
      approvalRequest : {type: Object},
      approvalChain : {type: Array},
      formLink : {type: String},
      totalExpenditures: {type: Number},
      queryObject: {type: Object}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.approvalRequestId = 0;
    this.approvalRequest = {};
    this.approvalChain = [];
    this.settingsCategory = 'approval-requests';
    this.allocationSummaryRef = createRef();
    this.formLink = '';

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'SettingsModel');
    this.waitController = new WaitController(this);
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this._canShowPage = false;
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
      this.AppStateModel.showError(d, {ele: this});
      return;
    }

    // bail if a callback redirected us
    const canShowPage = await this.waitController.waitForHostPropertyValue('_canShowPage', true, 2000);
    if ( canShowPage.wasTimeout ) return;

    this.formLink = `${this.AppStateModel.store.breadcrumbs['approval-request-new'].link}/${this.approvalRequestId}`;

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs['approval-requests'],
      {text: this.approvalRequest?.label || 'New', 'link': this.formLink},
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

    await this.waitController.waitForUpdate();

    const promises = [
      this.ApprovalRequestModel.query(this.queryObject),
      this.ApprovalRequestModel.getApprovalChain(this.approvalRequestId),
      this.SettingsModel.getByCategory(this.settingsCategory),
      this.allocationSummaryRef.value.init()
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  /**
   * @description Lit lifecycle hook
   * @param {Map} props - changed properties
   */
  willUpdate(props){
    if ( props.has('approvalRequest') ){
      this._setTotalExpenditures();
    }
  }

  /**
   * @description Callback for approval-request-chain-fetched event
   * Fires when the approval chain for the current approval request is fetched
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onApprovalRequestChainFetched(e) {
    if ( e.state !== 'loaded' ) return;
    if ( e.approvalRequestId !== this.approvalRequestId ) return;
    this.approvalChain = e.payload;
  }

  /**
   * @description Callback for when the submit button is clicked
   */
  _onSubmitButtonClick(){
    this.ApprovalRequestModel.statusUpdate(this.approvalRequestId, {action: 'submit'});
  }

  /**
   * @description Callback for when the save button is clicked
   * The request is already saved, so just show a success message
   */
  _onSaveButtonClick(){
    this.AppStateModel.showToast({message: 'Approval request saved', type: 'success'});
  }

  _onDeleteButtonClick(){
    this.AppStateModel.showDialogModal({
      title : 'Delete Approval Request',
      content : 'Are you sure you want to delete this approval request? This action cannot be undone.',
      actions : [
        {text: 'Delete', value: 'delete-approval-request', color: 'double-decker'},
        {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
      ],
      data : {approvalRequestId: this.approvalRequestId}
    });
  }

  /**
   * @description Callback for approval-request-status-update event
   * Fires when the status of an approval request is updated (e.g. after a submit action)
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onApprovalRequestStatusUpdate(e){
    if ( e.approvalRequestId !== this.approvalRequestId ) return;
    if ( e.action?.action !== 'submit' ) return;

    if ( e.state === 'error' ) {
      this.AppStateModel.showError(e, {ele: this});
      return;
    }

    if ( e.state === 'loading' ){
      this.AppStateModel.showLoading();
      return;
    }

    this.AppStateModel.showToast({message: 'Approval request submitted succesfully', type: 'success'});
    this.AppStateModel.setLocation(`/approval-request/${this.approvalRequestId}`);
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
      this.resetForm();
      this.AppStateModel.setLocation(this.AppStateModel.store.breadcrumbs['approval-requests'].link);
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
    this._canShowPage = true;
  }


  /**
   * @description Set approvalRequestId property from App State location (the url)
   * @param {Object} state - AppStateModel state
   */
  _setApprovalRequestId(state) {
    let approvalRequestId = Number(state?.location?.path?.[2]);
    this.approvalRequestId = Number.isInteger(approvalRequestId) && approvalRequestId > 0 ? approvalRequestId : 0;
    this.queryObject = {requestIds: this.approvalRequestId, isCurrent: true};
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

}

customElements.define('app-page-approval-request-confirm', AppPageApprovalRequestConfirm);
