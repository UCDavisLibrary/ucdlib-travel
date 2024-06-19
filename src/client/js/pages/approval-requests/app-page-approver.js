import { LitElement } from 'lit';
import { createRef } from 'lit/directives/ref.js';
import {render} from "./app-page-approver.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import urlUtils from "../../../../lib/utils/urlUtils.js";
import applicationOptions from '../../../../lib/utils/applicationOptions.js';


export default class AppPageApprover extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequestId : {type: Number},
      approvalRequest : {type: Object},
      queryObject: {type: Object},
      approvalRequestLink: {type: String},
      totalExpenditures: {type: Number},
      fundingSources: {type: Array},
      isFundingSourceChange: {type: Boolean},
      fundingSourceError: {type: Boolean},
      comments: {type: String},
      showLoaded: {type: Boolean}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'approval-requests';
    this.approvalRequest = {};
    this.approvalRequestLink = '';
    this.totalExpenditures = 0;
    this.fundingSourceSelectRef = createRef();
    this.fundingSources = [];
    this.isFundingSourceChange = false;
    this.fundingSourceError = false;
    this.comments = '';

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'SettingsModel', 'AuthModel');
  }

  /**
   * @description Lit lifecycle hook
   * @param {Map} props - changed properties
   */
  willUpdate(props){
    if ( props.has('approvalRequest') ){
      this._setTotalExpenditures();
      this.fundingSources = (this.approvalRequest.fundingSources || []).map(fs => {return {...fs}});
      this.isFundingSourceChange = false;
      this.fundingSourceError = false;
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

    // reset form properties
    this.comments = '';

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

    // need to ensure that funding-source-select element has been rendered before we can initialize it
    await this.waitController.waitForUpdate();

    const promises = [
      this.ApprovalRequestModel.query(this.queryObject),
      this.SettingsModel.getByCategory(this.settingsCategory),
      this.fundingSourceSelectRef.value.init(),
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
   * @description Attached to funding-source-select component. Fires if approver changes a funding source value.
   * @param {CustomEvent} e
   */
  _onFundingSourceInput(e){
    this.fundingSourceError = e.detail.hasError;
    let isFundingSourceChange = false;
    for (const fs of this.fundingSources) {
      const ogFs = this.approvalRequest.fundingSources.find(afs => afs.approvalRequestFundingSourceId === fs.approvalRequestFundingSourceId);
      if ( ogFs?.amount !== fs.amount ){
        isFundingSourceChange = true;
        break;
      }
    }
    this.isFundingSourceChange = isFundingSourceChange;
  }

  _onApprovalFormSubmit(e){
    let action;
    if (typeof e === 'string') {
      action = e;
    } else {
      e.preventDefault();
      action = this.isFundingSourceChange ? 'approve-with-changes' : 'approve';
    }
    if ( this.isFundingSourceChange && this.fundingSourceError ) return;
    this.AppStateModel.showDialogModal({
      title : 'Confirm Action',
      content : `Are you sure you want to perform the following action on this approval request:
        <ul class='list--arrow u-space-mb--large'>
          <li>
            <span class='primary bold'>${applicationOptions.approvalStatusActionLabel(action)}</span>
          </li>
        </ul>
        `,
      actions : [
        {text: 'Confirm', value: 'approve-approval-request', color: 'primary'},
        {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
      ],
      data : {approvalAction: action}
    });
  }

  /**
   * @description Callback for dialog-action AppStateModel event
   * @param {Object} e - AppStateModel dialog-action event
   * @returns
  */
  _onDialogAction(e){
    if ( e.action !== 'approve-approval-request' ) return;
    const payload = {action: e.data.approvalAction, comments: this.comments};
    if ( payload.action === 'approve-with-changes' ) {
      payload.fundingSources = this.fundingSources;
    }
    this.ApprovalRequestModel.statusUpdate(this.approvalRequestId, payload);
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

customElements.define('app-page-approver', AppPageApprover);
