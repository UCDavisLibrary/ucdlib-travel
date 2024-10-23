import { LitElement } from 'lit';
import { render } from "./user-current-allocation-summary.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import fiscalYearUtils from '../../../lib/utils/fiscalYearUtils.js';

/**
 * @description A component for displaying a user's current allocation summary
 * @property {String} pageId - The id of the page this component is on. Required.
 * @property {Number} approvalRequestId - If set, will add the approval request total to the allocation summary
 * Approval request can not be in 'approved' state. Optional.
 * @property {Boolean} forAnother - If true, will update language on component to clarify that allocation summary is for another. Optional.
 * @property {String} introText - The intro text for the component. Is loaded from settings API.
 * @property {Number} selectedFiscalYear - The selected fiscal year. Defaults to current fiscal year.
 * @property {Array} fiscalYears - The fiscal years to display in the tabs.
 * @property {Array} funds - The funds for the selected fiscal year.
 * @property {Object} fundsByFiscalYear - The funds by fiscal year. Loaded from EmployeeAllocationModel.
 */
export default class UserCurrentAllocationSummary extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      pageId: {type: String, attribute: 'page-id'},
      approvalRequestId: {type: Number, attribute: 'approval-request-id'},
      forAnother: {type: Boolean, attribute: 'for-another'},
      introText: {type: String},
      selectedFiscalYear: {type: Number},
      fiscalYears: {type: Array},
      funds: {type: Array},
      fundsByFiscalYear: {type: Object}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.introText = '';
    this.selectedFiscalYear = fiscalYearUtils.current().startYear;
    this.fiscalYears = fiscalYearUtils.getRangeFromDate(null, 1);
    this.funds = [];
    this.fundsByFiscalYear = {};
    this.approvalRequestId = 0;
    this.forAnother = false;

    this._injectModel('AppStateModel', 'SettingsModel', 'EmployeeAllocationModel');
  }

  /**
   * @description Lifecycle callback
   * @param {Map} props - The changed properties
   */
  willUpdate(props){
    if( props.has('selectedFiscalYear') ){
      this._setFunds();
    }
  }

  /**
   * @description Fetches data for the component
   * @returns {Promise} - A promise that resolves when the component is initialized
   */
  async init(){
    this.logger.info('fetching data');
    const args = {fiscalYears: this.fiscalYears.map(fy => fy.startYear)}
    if ( this.approvalRequestId ) args.approvalRequestId = this.approvalRequestId;
    const promises = [
      this.EmployeeAllocationModel.getUserAllocationsSummary(args),
      this.SettingsModel.getByCategory('approval-requests')
    ]
    const data = await Promise.allSettled(promises);
    this.logger.info('data fetched', data);

    return data;
  }

  /**
   * @description callback for 'settings-category-requested' event in SettingsModel
   * @param {Object} e - cork-app-utils event object
   * @returns 
   */
  _onSettingsCategoryRequested(e){
    if ( e.state !== 'loaded' || !this.AppStateModel.isActivePage(this.pageId) ) return;
    this.introText = this.SettingsModel.getByKey('allocation_summary_description');
  }

  /**
   * @description callback for 'user-allocations-summary-requested' event in EmployeeAllocationModel
   * @param {Object} e - cork-app-utils event object
   * @returns 
   */
  _onUserAllocationsSummaryRequested(e){
    if ( e.state !== 'loaded' || !this.AppStateModel.isActivePage(this.pageId) ) return;
    this.fundsByFiscalYear = e.payload;
    this._setFunds();
  }

  /**
   * @description Sets the funds array for the selected fiscal year
   */
  _setFunds(){
    this.funds = this.fundsByFiscalYear[this.selectedFiscalYear]?.funds || [];
  }

}

customElements.define('user-current-allocation-summary', UserCurrentAllocationSummary);
