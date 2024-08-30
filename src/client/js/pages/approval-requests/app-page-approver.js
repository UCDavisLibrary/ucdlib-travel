import { LitElement } from 'lit';
import { createRef } from 'lit/directives/ref.js';
import {render} from "./app-page-approver.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import urlUtils from "../../../../lib/utils/urlUtils.js";
import applicationOptions from '../../../../lib/utils/applicationOptions.js';

/**
 * @class AppPageApprover
 * @description Page element for approving an approval request
 * @property {Number} approvalRequestId - the id of the approval request to approve - set from url
 * @property {Object} approvalRequest - the approval request to approve - set from ApprovalRequestModel based on approvalRequestId
 * @property {Object} queryObject - query for fetching data for this approval request
 * @property {String} approvalRequestLink - the link to the main page for this approval request
 * @property {Number} totalExpenditures - the total amount of expenditures for this approval request - calculated from approvalRequest.expenditures
 * @property {Array} fundingSources - the funding sources for this approval request - set from approvalRequest.fundingSources
 * @property {Boolean} isFundingSourceChange - true if the approver has changed a funding source value
 * @property {Boolean} fundingSourceError - true if there is an error with a funding source value - aka the total amount does not match the total expenditures
 * @property {String} comments - the comments the approver has entered
 * @property {Boolean} _showLoaded - true if the page has loaded
 * @property {String} action - the action the approver has taken
 */
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
      _showLoaded: {type: Boolean},
      action: {state: true},
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
    this.allocationSummaryRef = createRef();
    this.fundingSources = [];
    this.isFundingSourceChange = false;
    this.fundingSourceError = false;
    this.comments = '';
    this.action = '';

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
    this._showLoaded = false;
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
      this.AppStateModel.showError(d, {ele: this});
      return;
    }

    // bail if a callback redirected us
    const _showLoaded = await this.waitController.waitForHostPropertyValue('_showLoaded', true, 2000);
    if ( _showLoaded.wasTimeout ) return;

    // reset form properties
    this.comments = '';
    this.action = '';

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
      this.allocationSummaryRef.value.init()
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

    const approverActionList = applicationOptions.approvalStatusActions.filter(a => a.actor === 'approver').map(a => a.value);
    approverActionList.push('approval-needed');
    const requestApproverActions = approvalRequest.approvalStatusActivity.filter(a => approverActionList.includes(a.action));
    const userAction = requestApproverActions.find(a => a.employeeKerberos === this.AuthModel.getToken().id);
    if ( !userAction ) {
      this.AppStateModel.showError('You are not authorized to approve this request.');
      return;
    }

    this.isNextApprover =
      userAction.action === 'approval-needed' &&
      !requestApproverActions.find(a =>
        a.action === 'approval-needed' &&
        a.employeeKerberos !== this.AuthModel.getToken().id && a.approverOrder < userAction.approverOrder
      );
    this.approvalRequest = approvalRequest;
    this._showLoaded = true;
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

  /**
   * @description Attached to approval form submit button. Fires when approver submits approval form
   * @param {Event} e - form submit event
   * @returns
   */
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
    this.action = payload.action;
    this.ApprovalRequestModel.statusUpdate(this.approvalRequestId, payload);
  }

  /**
   * @description Callback for approval-request-status-update event
   * Fires when the status of an approval request is updated (e.g. after the approval form action is processed by the server)
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onApprovalRequestStatusUpdate(e){
    if ( e.approvalRequestId !== this.approvalRequestId ) return;
    if ( e.action?.action !== this.action ) return;
    const action = applicationOptions.approvalStatusActions.find(a => a.value === this.action);

    if ( e.state === 'error' ) {
      this.AppStateModel.showError('Error submitting approval request.');
      return;
    }

    if ( e.state === 'loading' ){
      this.AppStateModel.showLoading();
      return;
    }

    this.AppStateModel.showToast({message: action.actionTakenText, type: 'success'});
    this.AppStateModel.setLocation(`/approval-request/${this.approvalRequestId}`);
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
