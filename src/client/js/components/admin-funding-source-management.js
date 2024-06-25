import { LitElement } from 'lit';
import {render} from "./admin-funding-source-management.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import ValidationHandler from '../utils/ValidationHandler.js';

export default class AdminFundingSourceManagement extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      parentPageId: {type: String, attribute: 'parent-page-id'},
      fundingSources: {type: Array},
      newFundingSource: {type: Object},
      approverTypes: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.parentPageId = '';
    this.fundingSources = [];
    this.newFundingSource = {};
    this.approverTypes = [];

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
      .filter(source => source.fundingSourceId !== 8);
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
      // todo remove empty approver types
      console.log('update funding source', fundingSource);

    } else {
      // todo remove empty approver types
      console.log('create new funding source', this.newFundingSource);
    }
  }

  _onDeleteClick(fundingSource){

  }

}

customElements.define('admin-funding-source-management', AdminFundingSourceManagement);
