import { LitElement } from 'lit';
import {render} from "./admin-funding-source-management.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import ValidationHandler from '../utils/ValidationHandler.js';

/**
 * @class AdminFundingSourceManagement
 * @description Component for managing funding sources
 * @property {String} parentPageId - id of the parent page
 * @property {Array} fundingSources - array of active funding sources from the FundingSourceModel
 * @property {Object} newFundingSource - new funding source form object
 * @property {Array} approverTypes - array of active approver types from the AdminApproverTypeModel
 * @property {Boolean} showNewFundingSourceForm - whether to show the new funding source form
 */
export default class AdminFundingSourceManagement extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      parentPageId: {type: String, attribute: 'parent-page-id'},
      fundingSources: {type: Array},
      newFundingSource: {type: Object},
      approverTypes: {type: Array},
      showNewFundingSourceForm: {type: Boolean},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.parentPageId = '';
    this.fundingSources = [];
    this.newFundingSource = {};
    this.approverTypes = [];
    this.showNewFundingSourceForm = false;

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'FundingSourceModel', 'AdminApproverTypeModel');
  }

  /**
   * @description Get required data for the component
   * @returns {Promise}
   */
  async init(){
    const promises = [
      this.FundingSourceModel.getActiveFundingSources(),
      this.AdminApproverTypeModel.query({status:"active"})
    ]
    return await Promise.allSettled(promises);
  }

  /**
   * @description lit lifecycle method
   */
  willUpdate(changedProps) {
    if ( changedProps.has('newFundingSource') ) {
      this.showNewFundingSourceForm = this.newFundingSource && Object.keys(this.newFundingSource).length > 0;
    }
  }

  /**
   * @description Callback for FundingSourceModel active-funding-sources-requested event
   * Fires whenever FundingSourceModel.getActiveFundingSources is called
   * Resets the local fundingSources array with the new data
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onActiveFundingSourcesRequested(e) {
    if ( e.state !== 'loaded' ) return;
    if ( !this.AppStateModel.isActivePage(this.parentPageId) ) return;

    this.fundingSources = e.payload
      .map(fundingSource => this._copyFundingSource(fundingSource))
      .filter(source => !source.hideFromForm);
  }

  /**
   * @description Callback for AdminApproverTypeModel approver-type-query-request event
   * Populates the approverTypes array with the data from the query
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  async _onApproverTypeQueryRequest(e){
    if ( e.state !== 'loaded' ) return;
    if ( !this.AppStateModel.isActivePage(this.parentPageId) ) return;

    this.approverTypes = JSON.parse(JSON.stringify(e.payload.filter(at => !at.hideFromFundAssignment)));
  }

  /**
   * @description bound to input fields in all funding source forms
   */
  _onFormInput(prop, value, fundingSource){
    fundingSource[prop] = value;
    this.requestUpdate();
  }

  /**
   * @description bound to add approver type button for each funding source
   * @param {Object} fundingSource - item from this.fundingSources or this.newFundingSource
   */
  _onAddApproverTypeClick(fundingSource){
    if ( !fundingSource.approverTypes ) fundingSource.approverTypes = [];
    fundingSource.approverTypes.push({approverTypeId: 0});
    this.requestUpdate();
  }

  /**
   * @description bound to select input for each approver type in a funding source
   */
  _onApproverTypeSelect(fundingSource, i, approverTypeId){
    const approverType = this.approverTypes.find(at => at.approverTypeId == approverTypeId);
    fundingSource.approverTypes[i] = approverType;
    this.requestUpdate();
  }

  /**
   * @description bound to remove approver type button for each funding source
   * @param {Object} fundingSource - funding source
   * @param {Number} i - index in fundingSource.approverTypes
   */
  _onRemoveApproverTypeClick(fundingSource, i){
    if ( fundingSource.approverTypes.length === 1) {
      fundingSource.approverTypes = [{approverTypeId: 0}];
    } else {
      fundingSource.approverTypes.splice(i, 1);
    }
    this.requestUpdate();
  }

  /**
   * @description bound to up/down arrow buttons for each approver type in each funding source
   * @param {Object} fundingSource - funding source
   * @param {Number} i - index in fundingSource.approverTypes
   * @param {String} direction - 'up' or 'down'
   * @returns
   */
  _onMoveApproverTypeClick(fundingSource, i, direction){
    if ( direction === 'up' ) {
      if ( i === 0 ) return;
      const temp = fundingSource.approverTypes[i];
      fundingSource.approverTypes[i] = fundingSource.approverTypes[i-1];
      fundingSource.approverTypes[i-1] = temp;
    } else {
      if ( i === fundingSource.approverTypes.length-1 ) return;
      const temp = fundingSource.approverTypes[i];
      fundingSource.approverTypes[i] = fundingSource.approverTypes[i+1];
      fundingSource.approverTypes[i+1] = temp;
    }
    this.requestUpdate();
  }

  /**
   * @description bound to edit button for each funding source
   */
  _onEditClick(fundingSource){
    fundingSource.editing = !fundingSource.editing;
    this.requestUpdate();
  }

  /**
   * @description bound to cancel button for each funding source form
   * Restores the funding source to its original state before editing
   * @param {Object} fundingSource - funding source
   * @returns
   */
  _onEditCancelClick(fundingSource){
    if ( !fundingSource.fundingSourceId ) {
      this.newFundingSource = {};
      return;
    }

    const storeFundingSource = (this.FundingSourceModel.store.data?.activeFundingSources?.payload || []).find(source => source.fundingSourceId == fundingSource.fundingSourceId);
    if ( !storeFundingSource ) {
      console.error('Could not find funding source with id', fundingSource.fundingSourceId);
      this.AppStateModel.showToast({message: 'An unknown error ocurred', type: 'error'});
      return;
    }
    const fundingSourceIndex = this.fundingSources.findIndex(source => source.fundingSourceId == fundingSource.fundingSourceId);
    this.fundingSources[fundingSourceIndex] = this._copyFundingSource(storeFundingSource);
    this.requestUpdate();
  }

  /**
   * @description copy and set up a funding source for editing
   * @param {Object} fundingSource - funding source
   * @returns {Object}
   */
  _copyFundingSource(fundingSource){
    fundingSource = JSON.parse(JSON.stringify(fundingSource));
    fundingSource.editing = false;
    fundingSource.validationHandler = new ValidationHandler();
    if ( !Array.isArray(fundingSource.approverTypes) ) fundingSource.approverTypes = [];
    if ( !fundingSource.approverTypes.length ) fundingSource.approverTypes.push({approverTypeId: 0});
    return fundingSource;
  }

  /**
   * @description bound to submit event for each funding source form
   * @param {Event} e - submit event
   * @returns
   */
  _onSubmit(e){
    e.preventDefault();
    this.lastScrollPosition = window.scrollY;
    const fundingSourceId = e.target.getAttribute('funding-source-id')

    if ( fundingSourceId ){
      const fundingSource = this.fundingSources.find(source => source.fundingSourceId == fundingSourceId);
      if ( !fundingSource ) {
        console.error('Could not find funding source with id', fundingSourceId);
        this.AppStateModel.showToast({message: 'An unknown error ocurred', type: 'error'});
        return;
      }
      fundingSource.approverTypes = fundingSource.approverTypes.filter(at => at.approverTypeId);
      this.FundingSourceModel.update(fundingSource);

    } else {
      this.newFundingSource.approverTypes = this.newFundingSource.approverTypes.filter(at => at.approverTypeId);
      this.FundingSourceModel.create(this.newFundingSource);
    }
  }

  /**
   * @description Callback for FundingSourceModel updated event
   * @param {Object} e - cork-app-utils event object
   */
  async _onFundingSourceUpdated(e){
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        const fundingSource = this.fundingSources.find(source => source.fundingSourceId == e.requestBody?.fundingSourceId);
        fundingSource.validationHandler = new ValidationHandler(e);
        this.AppStateModel.showLoaded(this.parentPageId)
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when updating the funding source. Form data needs fixing.', type: 'error'})

      } else {
        this.AppStateModel.showToast({message: 'An unknown error ocurred when updating the funding source', type: 'error'})
        this.AppStateModel.showLoaded(this.parentPageId)
      }
      await this.waitController.waitForFrames(3);
      window.scrollTo(0, this.lastScrollPosition);
    } else if ( e.state === 'loading' ) {
      this.AppStateModel.showLoading();
    } else if ( e.state === 'loaded' ) {
      this.AppStateModel.refresh();
      if ( e.requestBody?.archived ) {
        this.AppStateModel.showToast({message: 'Funding source deleted successfully', type: 'success'});
      } else {
        this.AppStateModel.showToast({message: 'Funding source updated successfully', type: 'success'});
      }
    }
  }

  /**
   * @description Callback for FundingSourceModel created event
   * @param {Object} e - cork-app-utils event object
   */
  async _onFundingSourceCreated(e){
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        this.newFundingSource.validationHandler = new ValidationHandler(e);
        this.AppStateModel.showLoaded(this.parentPageId)
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when creating the funding source. Form data needs fixing.', type: 'error'})

      } else {
        this.AppStateModel.showToast({message: 'An unknown error ocurred when creating the funding source', type: 'error'})
        this.AppStateModel.showLoaded(this.parentPageId)
      }
      await this.waitController.waitForFrames(3);
      window.scrollTo(0, this.lastScrollPosition);
    } else if ( e.state === 'loading' ) {
      this.AppStateModel.showLoading();
    } else if ( e.state === 'loaded' ) {
      this.newFundingSource = {};
      this.AppStateModel.refresh();
      this.AppStateModel.showToast({message: 'Funding source created successfully', type: 'success'});
    }
  }

  /**
   * @description bound to add new funding source button
   * Displays the new funding source form
   */
  async _onNewClick(){
    this.newFundingSource = this._copyFundingSource({});
    await this.waitController.waitForUpdate();
    const form = this.renderRoot.querySelector('.new-funding-source-form');
    if ( form ) form.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  }

  /**
   * @description bound to delete button for each funding source
   * Prompts the user to confirm deletion of the funding source
   * @param {Object} fundingSource - funding source
   */
  _onDeleteClick(fundingSource){
    this.AppStateModel.showDialogModal({
      title : 'Delete Funding Source',
      content : 'Are you sure you want to delete this funding source?',
      actions : [
        {text: 'Delete', value: 'delete-funding-source', color: 'double-decker'},
        {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
      ],
      data : {fundingSource}
    });
  }

  /**
   * @description Callback for dialog-action AppStateModel event
   * @param {Object} e - AppStateModel dialog-action event
   * @returns
   */
  _onDialogAction(e){
    if ( e.action !== 'delete-funding-source' ) return;
    const fundingSource = e.data.fundingSource;
    fundingSource.archived = true;
    this.FundingSourceModel.update(fundingSource);
  }

}

customElements.define('admin-funding-source-management', AdminFundingSourceManagement);
