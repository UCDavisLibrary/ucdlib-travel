import { LitElement } from 'lit';
import {render} from "./app-page-reports.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import objectUtils from '../../../../lib/utils/objectUtils.js';
import fiscalYearUtils from '../../../../lib/utils/fiscalYearUtils.js';

export default class AppPageReports extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      page: {type: String},
      helpUrl: {type: String},
      filterRows: {state: true},
      selectedFilters: {state: true}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);
    this.page = this.getPageId('403');
    this.helpUrl = ''

    this.filterRows = [];
    this.selectedFilters = {
      fiscalYear: [fiscalYearUtils.current().startYear]
    };

    this._injectModel('AppStateModel', 'ReportsModel');
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
      this.ReportsModel.getFilters()
    ];
    return await Promise.allSettled(promises);
  }

  getPageId(page){
    return `${this.id}-page--${page}`;
  }

  _onReportsFiltersFetched(e){
    if ( !this.AppStateModel.isActivePage(this) || e.state !== 'loaded') return;
    this.filterRows = objectUtils.chunkArray(e.payload, 4);
  }

  _onFilterChange(e, filter){
    this.selectedFilters[filter.type] = e.detail.map(v => filter.isNumber ? Number(v.value) : v.value);
    this.requestUpdate();
    console.log(this.selectedFilters);

  }

}

customElements.define('app-page-reports', AppPageReports);
