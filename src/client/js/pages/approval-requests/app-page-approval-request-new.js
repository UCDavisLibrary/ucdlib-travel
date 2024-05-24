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
      canBeDeleted: {type: Boolean},
      canBeSaved: {type: Boolean},
      isSave: {type: Boolean},
      expenditureOptions: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.approvalFormId = 0;
    this.settingsCategory = 'approval-requests';
    this.expenditureOptions = [];

    this._injectModel(
      'AppStateModel', 'SettingsModel', 'ApprovalRequestModel',
      'AuthModel', 'LineItemsModel'
    );

    this.resetForm();
  }

  /**
   * @description Lit lifecycle method
   */
  willUpdate(props){
    if ( props.has('approvalRequest') ){
      this._setUserCantSubmit();
      this.canBeSaved = ['draft', 'revision-requested'].includes(this.approvalRequest.approvalStatus);
    }
  }

  /**
   * @description Sets the userCantSubmit property based on the current approval request
   * Used to determine if the form can be submitted, but server side validation will also check this
   */
  _setUserCantSubmit(){
      let userCantSubmit = false;
      if ( this.approvalRequest.employeeKerberos && this.approvalRequest.employeeKerberos !== this.AuthModel.getToken().id ){
        userCantSubmit = true;
      } else if ( !['draft', 'revision-requested'].includes(this.approvalRequest.approvalStatus) ){
        userCantSubmit = true;
      }
      this.userCantSubmit = userCantSubmit;
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
    const promises = [
      this.SettingsModel.getByCategory(this.settingsCategory),
      this.LineItemsModel.getActiveLineItems()
    ];
    if ( this.approvalFormId ) {
      promises.push(this.ApprovalRequestModel.query({requestIds: this.approvalFormId}));
    }
    const resolvedPromises = await Promise.allSettled(promises);
    return resolvedPromises;
  }

  _onActiveLineItemsFetched(e){
    if ( e.state !== 'loaded' ) return;
    this.expenditureOptions = e.payload;
  }

  async _onSubmit(e){
    e.preventDefault();
    this.isSave = false;
    const ar = this.approvalRequest

    ar.approvalStatus = 'draft';
    // todo: ensure to set forceValidation flag on request


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

    this.canBeDeleted = e.payload.data.find(r => r.approvalStatus !== 'draft') ? false : true;
    this.validationHandler = new ValidationHandler();
    this.approvalRequest = { ...currentInstance };

    console.log(e);
  }

  /**
   * @description Reset form properties.
   */
  resetForm(){
    this.approvalRequest = {
      approvalStatus: 'draft',
      expenditures: []
    };
    this.validationHandler = new ValidationHandler();
    this.canBeDeleted = false;
    this.requestUpdate();
  }

  /**
   * @description Bound to save button click event
   * No validations or payload transformation done when saving a draft.
   */
  _onSaveButtonClick(){
    if ( this.userCantSubmit || !this.canBeSaved ) return;
    this.isSave = true;
    this.approvalRequest.approvalStatus = 'draft';
    this.ApprovalRequestModel.create(this.approvalRequest);
  }

  /**
   * @description Callback for ApprovalRequestModel approval-request-created event
   * Fires after a draft is saved or a new approval request is submitted
   * @param {*} e
   */
  _onApprovalRequestCreated(e){
    if ( e.state === 'error' ) {
      this.isSave = false;
      if ( e.error?.payload?.is400 ) {
        this.validationHandler = new ValidationHandler(e);
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when submitting your approval request. Form data needs fixing.', type: 'error'});
      } else {
        this.AppStateModel.showToast({message: 'An unknown error occurred when submitting your approval request', type: 'error'});
      }
      this.AppStateModel.showLoaded(this.id);
    } else if ( e.state === 'loading') {
      this.AppStateModel.showLoading();
    } else if ( e.state === 'loaded' ) {
      const oldApprovalRequestId = this.approvalRequest.approvalRequestId;
      const newApprovalRequestId = e.payload.approvalRequestId;
      this.resetForm();

      if ( this.isSave ) {

        if ( oldApprovalRequestId ) {
          this.AppStateModel.refresh();
        } else {
          const loc = `${this.AppStateModel.store.breadcrumbs[this.id].link}/${newApprovalRequestId}`
          this.AppStateModel.setLocation(loc);
        }
        this.AppStateModel.showToast({message: 'Draft saved.', type: 'success'});

        // submitted - send to confirmation page
      } else {
        const loc = `${this.AppStateModel.store.breadcrumbs['approval-request-confirm'].link}/${newApprovalRequestId}`;
        this.AppStateModel.setLocation(loc);
      }

      this.isSave = false;
    }
  }

  /**
   * @description Bound to delete button click event
   * Calls confirmation dialog to delete the approval request
   */
  _onDeleteButtonClick(){
    if ( !this.canBeDeleted || this.userCantSubmit ) return;
    this.AppStateModel.showDialogModal({
      title : 'Delete Approval Request',
      content : 'Are you sure you want to delete this approval request? This action cannot be undone.',
      actions : [
        {text: 'Delete', value: 'delete-approval-request', color: 'double-decker'},
        {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
      ],
      data : {approvalRequestId: this.approvalRequest.approvalRequestId}
    });
  }

  /**
   * @description Callback for dialog-action AppStateModel event
   * @param {Object} e - AppStateModel dialog-action event
   * @returns
  */
  _onDialogAction(e){
    if ( e.action !== 'delete-approval-request' ) return;
    this.ApprovalRequestModel.delete(e.data.approvalRequestId);
  }

  /**
   * @description Bound to ApprovalRequestModel approval-request-deleted event
   * @param {Object} e - ApprovalRequestModel approval-request-deleted event
   * @returns
   */
  _onApprovalRequestDeleted(e){
    if ( e.state === 'loading' ){
      this.AppStateModel.showLoading();
      return;
    }

    if ( e.state === 'loaded' ){
      this.resetForm();
      this.AppStateModel.setLocation(this.AppStateModel.store.breadcrumbs['approval-requests'].link);
      this.AppStateModel.showToast({message: 'Approval request deleted.', type: 'success'});
      return;
    }

    this.AppStateModel.showLoaded(this.id);
    this.AppStateModel.showToast({message: 'Error deleting approval request.', type: 'error'});
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
