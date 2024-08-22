import { LitElement } from 'lit';
import { render } from "./user-current-allocation-summary.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import fiscalYearUtils from '../../../lib/utils/fiscalYearUtils.js';

export default class UserCurrentAllocationSummary extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      pageId: {type: String, attribute: 'page-id'},
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

    this._injectModel('AppStateModel', 'SettingsModel', 'EmployeeAllocationModel');
  }

  willUpdate(props){
    if( props.has('selectedFiscalYear') ){
      this._setFunds();
    }
  }

  async init(){
    this.logger.info('fetching data');
    const promises = [
      this.SettingsModel.getByCategory('approval-requests'),
      this.EmployeeAllocationModel.getUserAllocationsSummary({fiscalYears: this.fiscalYears.map(fy => fy.startYear)})
    ]
    const data = await Promise.allSettled(promises);
    this.logger.info('data fetched', data);

    return data;
  }

  _onSettingsCategoryRequested(e){
    if ( e.state !== 'loaded' || !this.AppStateModel.isActivePage(this.pageId) ) return;
    this.introText = this.SettingsModel.getByKey('allocation_summary_description');
  }

  _onUserAllocationsSummaryRequested(e){
    if ( e.state !== 'loaded' || !this.AppStateModel.isActivePage(this.pageId) ) return;
    this.fundsByFiscalYear = e.payload;
    this._setFunds();
  }

  _setFunds(){
    this.funds = this.fundsByFiscalYear[this.selectedFiscalYear]?.funds || [];
  }

}

customElements.define('user-current-allocation-summary', UserCurrentAllocationSummary);
