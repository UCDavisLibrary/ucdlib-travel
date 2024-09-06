import { LitElement } from 'lit';
import {render} from "./app-page-reports.tpl.js";
import { createRef } from 'lit/directives/ref.js';

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import fiscalYearUtils from '../../../../lib/utils/fiscalYearUtils.js';
import reportUtils from '../../../../lib/utils/reports/reportUtils.js';

export default class AppPageReports extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      page: {type: String},
      helpUrl: {type: String},
      helpDialogPage: {type: String},
      filters: {state: true},
      selectedFilters: {state: true},
      selectedMetrics: {state: true},
      selectedAggregatorX: {state: true},
      selectedAggregatorY: {state: true}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);
    this.page = this.getPageId('403');
    this.helpUrl = ''
    this.helpDialogRef = createRef();
    this.helpDialogPage = 'metrics';

    this.filters = [];
    this.selectedFilters = {
      fiscalYear: [fiscalYearUtils.current().startYear]
    };
    this.selectedMetrics = reportUtils.defaultMetrics(true);
    this.selectedAggregatorX = reportUtils.defaultAggregator('x', true);
    this.selectedAggregatorY = reportUtils.defaultAggregator('y', true);

    this._injectModel('AppStateModel', 'ReportsModel', 'SettingsModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Reports');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);


    const accessLevel = await this.ReportsModel.getAccessLevel();
    this.logger.info('access level fetched', accessLevel);
    if ( accessLevel.state === 'error' ) {
      this.AppStateModel.showError(accessLevel, {ele: this});
      return;
    }

    if ( !accessLevel.payload.hasAccess){
      this.page = this.getPageId('403');
      this.helpUrl = accessLevel.payload.helpUrl;
      this.AppStateModel.showLoaded(this.id);
      return;
    }

    const d = await this.getPageData();
    this.logger.info('page data fetched', d);
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if ( hasError ) {
      this.AppStateModel.showError(d, {ele: this});
      return;
    }

    this.page = this.getPageId('builder');
    this.AppStateModel.showLoaded(this.id);
  }

  async getPageData(){
    const promises = [
      this.ReportsModel.getFilters(),
      this.SettingsModel.getByCategory('reports')
    ];
    return await Promise.allSettled(promises);
  }

  getPageId(page){
    return `${this.id}-page--${page}`;
  }

  _onReportsFiltersFetched(e){
    if ( !this.AppStateModel.isActivePage(this) || e.state !== 'loaded') return;
    this.filters = e.payload;
  }

  _onFilterChange(e, filter){
    this.selectedFilters[filter.type] = e.detail.map(v => filter.isNumber ? Number(v.value) : v.value);
    this.requestUpdate();
    console.log(this.selectedFilters);
  }

  _onHelpClick(page){
    this.helpDialogPage = page;
    this.helpDialogRef.value.showModal();
  }

  _onAggregatorChange(e, axis){

    axis = axis.toUpperCase();
    const multipleMetrics = this.selectedMetrics.length > 1;
    const newValue = e.target.value;
    const existingValue = this[`selectedAggregator${axis}`];
    const otherAxisValue = this[`selectedAggregator${axis === 'X' ? 'Y' : 'X'}`];

    if ( multipleMetrics && !existingValue && newValue ) {
      this.AppStateModel.showToast({
        type: 'error',
        message: 'When multiple metrics are selected, only one aggregator can be used'
      });
      e.target.value = existingValue;
      return;
    }

    if ( !newValue && !otherAxisValue ) {
      this.AppStateModel.showToast({
        type: 'error',
        message: 'At least one aggregator must be selected'
      });
      e.target.value = existingValue;
      return;
    }

    this[`selectedAggregator${axis}`] = newValue;
  }

  _onAggregatorSwap(){
    const temp = this.selectedAggregatorX;
    this.selectedAggregatorX = this.selectedAggregatorY;
    this.selectedAggregatorY = temp;
  }


}

customElements.define('app-page-reports', AppPageReports);
