import { LitElement } from 'lit';
import {render} from "./app-page-reimbursement.tpl.js";

import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import typeTransform from '../../../../lib/utils/typeTransform.js';
import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import reimbursmentExpenses from '../../../../lib/utils/reimbursmentExpenses.js';

export default class AppPageReimbursement extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      reimbursementRequestId : {type: Number},
      reimbursementRequest : {type: Object},
      approvalRequest : {type: Object},
      statusFormData : {type: Object},
      _transportationExpenses: {state: true},
      _registrationExpenses: {state: true},
      _dailyExpenses: {state: true},
      _reimbursementQueryObject: {state: true},
      _showLoaded: {state: true},
      _noFundTransactionsText: {state: true},
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);

    this.reimbursementRequestId = 0;
    this.reimbursementRequest = {};
    this.approvalRequest = {};
    this._transportationExpenses = reimbursmentExpenses.hydrateTransportationExpenses();
    this._registrationExpenses = reimbursmentExpenses.hydrateRegistrationFeeExpenses();
    this._dailyExpenses = reimbursmentExpenses.hydrateDailyExpenses();
    this._noFundTransactionsText = '';
    this.statusFormData = {};

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'ReimbursementRequestModel', 'SettingsModel', 'AuthModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this._showLoaded = false;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle({show: false});
    this.AppStateModel.setBreadcrumbs({show: false});

    this._setReimbursementRequestId(state);
    if ( !this.reimbursementRequestId ) {
      this.AppStateModel.showError('Reimbursement request not found');
      return;
    }

    const d = await this.getPageData();
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if ( hasError ) {
      this.AppStateModel.showError(d);
      return;
    }

    // bail if a callback redirected us
    const _showLoaded = await this.waitController.waitForHostPropertyValue('_showLoaded', true, 2000);
    if ( _showLoaded.wasTimeout ) return;

    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){

    const promises = [
      this.ReimbursementRequestModel.query(this._reimbursementQueryObject),
      this.SettingsModel.getByCategory('reimbursement-requests')
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  _onEditFundTransactionClicked(transaction){
    if ( !transaction ) {
      this.statusFormData = {};
    } else {
      this.statusFormData = {...transaction};
    }
  }

  /**
   * @description bound to SettingsModel settings-category-requested event
   * @param {Object} e - cork-app-utils event
   * @returns
   */
  _onSettingsCategoryRequested(e){
    if ( e.state !== 'loaded' ||  e.category !== 'reimbursement-requests' ) return;
    this._noFundTransactionsText = this.SettingsModel.getByKey('reimbursement_no_fund_transactions_message');
  }

  /**
   * @description Set the reimbursementRequestId from the url
   * @param {Object} state - AppStateModel state
   */
  _setReimbursementRequestId(state){
    let id = state?.location?.path?.[1];
    id = typeTransform.toPositiveInt(id) || 0;
    this.reimbursementRequestId = id;
    this._reimbursementQueryObject = {reimbursementRequestIds: [id], isCurrent: true, includeApprovalRequest: true};
  }

  /**
   * @description Bound to reimbursement-request-requested event
   * @param {Object} e - cork-app-utils event
   * @returns
   */
  _onReimbursementRequestRequested(e){
    if ( e.state !== 'loaded' ) return;
    if ( !this.AppStateModel.isActivePage(this) ) return;

    if ( !e.payload.total ){
      this.AppStateModel.showError('Reimbursement request not found');
      return;
    }

    this.reimbursementRequest = e.payload.data[0];
    this.approvalRequest = this.reimbursementRequest?.approvalRequest || {};
    this._transportationExpenses = reimbursmentExpenses.hydrateTransportationExpenses(this.reimbursementRequest.expenses);
    this._registrationExpenses = reimbursmentExpenses.hydrateRegistrationFeeExpenses(this.reimbursementRequest.expenses);
    this._dailyExpenses = reimbursmentExpenses.hydrateDailyExpenses(this.reimbursementRequest.expenses);

    if ( !this.approvalRequest?.approvalRequestId ) {
      this.AppStateModel.showError('Associated approval request not found');
    }

    this._showLoaded = true;
  }

  _onDailyExpenseNotesClicked(dailyExpense){
    this.AppStateModel.showDialogModal({
      title: `Daily Expense Notes for ${dailyExpense.date}`,
      content: dailyExpense.notes || 'No notes provided'
    });
  }

}

customElements.define('app-page-reimbursement', AppPageReimbursement);
