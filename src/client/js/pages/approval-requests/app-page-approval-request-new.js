import { LitElement } from 'lit';
import {render} from "./app-page-approval-request-new.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import ValidationHandler from "../../utils/ValidationHandler.js";
import urlUtils from "../../../../lib/utils/urlUtils.js";

export default class AppPageApprovalRequestNew extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalFormId: {type: Number},
      approvalRequest: {type: Object},
      userCantSubmit: {type: Boolean},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.approvalFormId = 0;
    this.settingsCategory = 'approval-requests';

    this._injectModel('AppStateModel', 'SettingsModel', 'ApprovalRequestModel', 'AuthModel');
    this.resetForm();
  }

  /**
   * @description Lit lifecycle method
   */
  willUpdate(props){
    if ( props.has('approvalRequest') ){

      // set userCantSubmit property, which is used to determine if the form can be submitted
      // server side validation will also check this
      let userCantSubmit = false;
      if ( this.approvalRequest.employeeKerberos && this.approvalRequest.employeeKerberos !== this.AuthModel.getToken().id ){
        userCantSubmit = true;
      } else if ( !['draft', 'revision-requested'].includes(this.approvalRequest.approvalStatus) ){
        userCantSubmit = true;
      }
      this.userCantSubmit = userCantSubmit;
    }
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('New Approval Request');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs['approval-requests'],
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    this._setApprovalFormId(state);

    const d = await this.getPageData();
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if ( hasError ) {
      this.AppStateModel.showError(d);
      return;
    }

    this.AppStateModel.showLoaded(this.id);
    this.requestUpdate();
  }

  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){
    const promises = [];
    promises.push(this.SettingsModel.getByCategory(this.settingsCategory));
    if ( this.approvalFormId ) {
      promises.push(this.ApprovalRequestModel.query({requestIds: this.approvalFormId}));
    }
    const resolvedPromises = await Promise.allSettled(promises);
    return resolvedPromises;
  }

  async _onSubmit(e){
    e.preventDefault();
    const ar = this.approvalRequest


    // set conditional request dates
    if ( ar.programStartDate && !ar.programEndDate ) {
      ar.programEndDate = ar.programStartDate;
    }
    if ( ar.travelRequired){
      if ( ar.hasCustomTravelDates ){
        if ( ar.travelStartDate && !ar.travelEndDate ) {
          ar.travelEndDate = ar.travelStartDate;
        }
      } else {
        ar.travelStartDate = ar.programStartDate;
        ar.travelEndDate = ar.programEndDate
      }
    } else {
      delete ar.travelStartDate;
      delete ar.travelEndDate
    }

    console.log('submit', this.approvalRequest);
  }

  /**
   * @description bound to form input events
   * @param {String} property - the property to update
   * @param {String} value - the new value for the property
   */
  _onFormInput(property, value){
    this.approvalRequest[property] = value;
    this.requestUpdate();
  }

  /**
   * @description bound to ApprovalRequestModel approval-requests-fetched event
   * Handles setting the form state based on a previously saved (or submitted and rejected) approval request
   */
  _onApprovalRequestsRequested(e){
    if ( e.state !== 'loaded' ) return;

    // check that request was issue by this element
    const elementQueryString = urlUtils.queryObjectToKebabString({requestIds: this.approvalFormId});
    if ( e.query !== elementQueryString ) return;

    if ( !e.payload.total ){
      this.resetForm();
      setTimeout(() => {
        this.AppStateModel.showError('This approval request does not exist.');
      }, 100);
      return;
    }

    // get the current instance of the approval request
    const currentInstance = e.payload.data.find(r => r.isCurrent)
    if ( !currentInstance ) {
      this.resetForm();
      console.error('No current instance found for approval request', e.payload.data);
      setTimeout(() => {
        this.AppStateModel.showError();
      }, 100);
      return;
    }

    this.validationHandler = new ValidationHandler();
    this.approvalRequest = { ...currentInstance };

    console.log(e);
  }

  /**
   * @description Reset form properties.
   */
  resetForm(){
    this.approvalRequest = {
      approvalStatus: 'draft'
    };
    this.validationHandler = new ValidationHandler();
    this.requestUpdate();
  }

  /**
   * @description Set approvalFormId property from App State location (the url)
   * @param {Object} state - AppStateModel state
   */
  _setApprovalFormId(state) {
    let approvalFormId = Number(state?.location?.path?.[2]);
    this.approvalFormId = Number.isInteger(approvalFormId) && approvalFormId > 0 ? approvalFormId : 0;
  }

}

customElements.define('app-page-approval-request-new', AppPageApprovalRequestNew);
