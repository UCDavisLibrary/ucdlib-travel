import { LitElement } from 'lit';
import { createRef } from 'lit/directives/ref.js';
import {render} from "./app-page-reimbursement-new.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';
import typeTransform from '../../../../lib/utils/typeTransform.js';
import reimbursementExpenses from '../../../../lib/utils/reimbursementExpenses.js';

export default class AppPageReimbursementNew extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequestId : {type: Number},
      approvalRequest : {type: Object},
      approvalRequestQueryObject: {state: true},
      showLoaded: {state: true},
      mileageRate: {state: true},
      expenseWarning: {state: true},
      approvedExpenses: {state: true},
      otherTotalExpenses: {state: true},
      receiptDescription: {state: true},
      labelOptions: {state: true},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.approvalRequestId = 0;
    this.approvalRequest = {};
    this.form = createRef();
    this.mileageRate = 0;
    this.approvedExpenses = '0.00';
    this.otherTotalExpenses = '0.00';
    this.expenseWarning = '';
    this.labelOptions = [];

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'SettingsModel', 'ReimbursementRequestModel');
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
      this.AppStateModel.showError(d, {ele: this});
      return;
    }

    // bail if a callback redirected us
    const showLoaded = await this.waitController.waitForHostPropertyValue('showLoaded', true, 2000);
    if ( showLoaded.wasTimeout ) return;

    this.AppStateModel.showLoaded(this.id);

    this.requestUpdate();
  }

  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){

    const promises = [
      this.ApprovalRequestModel.query(this.approvalRequestQueryObject),
      this.SettingsModel.getByCategory('reimbursement-requests'),
      this.ReimbursementRequestModel.query({approvalRequestIds: [this.approvalRequestId], isCurrent: true, pageSize: -1})
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  /**
   * @description bound to SettingsModel settings-category-requested event
   * @param {Object} e - cork-app-utils event
   * @returns
   */
  _onSettingsCategoryRequested(e){
    if ( e.state !== 'loaded' ||  e.category !== 'reimbursement-requests' ) return;
    const mileageRate = typeTransform.toPositiveNumber(this.SettingsModel.getByKey('mileage_rate'));
    this.mileageRate = mileageRate ? mileageRate : 0;
    this.expenseWarning = this.SettingsModel.getByKey('reimbursement_form_exceed_message');
    this.receiptDescription = this.SettingsModel.getByKey('reimbursement_form_receipts');
    this.labelOptions = typeTransform.splitStringLines(this.SettingsModel.getByKey('reimbursement_form_label_options', []));
  }

  _onReimbursementRequestRequested(e){
    if ( e.state !== 'loaded' ) return;
    if ( !this.AppStateModel.isActivePage(this) ) return;

    let otherTotalExpenses = 0;
    for (const r of e.payload.data) {
      otherTotalExpenses += Number(reimbursementExpenses.addExpenses(r.expenses));
    }
    this.otherTotalExpenses = otherTotalExpenses.toFixed(2);
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
    this.AppStateModel.showError('Cannot create reimbursement request: no approval request found');
    return;
  }

  const approvalRequest = e.payload.data.find(r => r.isCurrent);

  if ( approvalRequest.approvalStatus !== 'approved' ) {
    this.AppStateModel.showError('Cannot create reimbursement request: approval request has not been approved.');
    return;
  }

  if ( !applicationOptions.reimbursementStatuses.filter(s => s.isActive).map(s => s.value).includes(approvalRequest.reimbursementStatus) ) {
    this.AppStateModel.showError('Cannot create reimbursement new request.');
    return;
  }

  this.approvalRequest = approvalRequest;
  this.approvedExpenses = reimbursementExpenses.addExpenses(approvalRequest.expenditures || []);
  this.form.value.resetForm();
  this.form.value.setDatesFromApprovalRequest(approvalRequest);

  this.showLoaded = true;
}


  /**
   * @description Set approvalRequestId property from App State location (the url)
   * @param {Object} state - AppStateModel state
   */
  _setApprovalRequestId(state) {
    let approvalRequestId = Number(state?.location?.path?.[2]);
    this.approvalRequestId = Number.isInteger(approvalRequestId) && approvalRequestId > 0 ? approvalRequestId : 0;
    this.approvalRequestQueryObject = {requestIds: this.approvalRequestId, isCurrent: true};
  }

}

customElements.define('app-page-reimbursement-new', AppPageReimbursementNew);
