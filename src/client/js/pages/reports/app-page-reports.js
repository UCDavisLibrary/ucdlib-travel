import { LitElement } from 'lit';
import { render } from "./app-page-reports.tpl.js";
import { createRef } from 'lit/directives/ref.js';

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import Papa from 'papaparse'

import fiscalYearUtils from '../../../../lib/utils/fiscalYearUtils.js';
import reportUtils from '../../../../lib/utils/reports/reportUtils.js';

/**
 * @class AppPageReports
 * @description Main page for the reports section of the application
 * - Generates reports based on selected filters and metrics
 * - Displays approval requests for the selected filters
 * @property {String} page - current subpage id
 * @property {String} helpUrl - url for the help documentation
 * @property {String} helpDialogPage - page to show in the help dialog
 * @property {Array} filters - available report filters
 * @property {Object} selectedFilters - selected report filters by type
 * @property {Array} selectedMetrics - selected report metrics
 * @property {String} selectedAggregatorX - selected aggregator for the X axis
 * @property {String} selectedAggregatorY - selected aggregator for the Y axis
 * @property {Array} report - Report data - array of arrays of report cells
 * @property {Array} departmentRestrictions - department restrictions for the current user (they can only see reports for these departments)
 * @property {Number} approvalRequestPage - current pagination number of approval requests view
 * @property {Number} approvalRequestTotalPages - total number of pages of approval requests
 * @property {Array} approvalRequests - approval requests for the selected filters
 *
 */
export default class AppPageReports extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      page: {type: String},
      helpUrl: {type: String},
      helpDialogPage: {type: String},
      filters: {type: Array},
      selectedFilters: {type: Object},
      selectedMetrics: {type: Array},
      selectedAggregatorX: {type: String},
      selectedAggregatorY: {type: String},
      report: {type: Array},
      departmentRestrictions: {type: Array},
      approvalRequestPage: {type: Number},
      approvalRequestTotalPages: {type: Number},
      approvalRequests: {type: Array},
      generatingReport: {state: true},
      reportIsEmpty: {state: true},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.page = this.getPageId('403');
    this.helpUrl = ''
    this.helpDialogRef = createRef();
    this.helpDialogPage = 'metrics';
    this.report = [];
    this.approvalRequestPage = 1;
    this.approvalRequestTotalPages = 1;
    this.approvalRequests = [];
    this.departmentRestrictions = [];

    this.filters = [];
    this.selectedFilters = {
      fiscalYear: [fiscalYearUtils.current().startYear]
    };
    this.selectedMetrics = reportUtils.defaultMetrics(true);
    this.selectedAggregatorX = reportUtils.defaultAggregator('x', true);
    this.selectedAggregatorY = reportUtils.defaultAggregator('y', true);

    this.generatingReport = false;

    this._injectModel('AppStateModel', 'ReportsModel', 'SettingsModel', 'ApprovalRequestModel');
  }

  /**
   * @description Lit lifecycle method
   * @param {Map} props - changed properties
   */
  willUpdate(props){
    if ( props.has('report') ){
      this._setReportIsEmpty();
    }
  }

  /**
   * @description Lit lifecycle method
   * @param {Map} props - changed properties
   */
  updated(props){

    // override the shadow dom styles for the slim select filters
    if (props.has('page') && this.page === this.getPageId('approval-requests')){
      const selectFilters = document.querySelectorAll(`#${this.getPageId('approval-requests')} ucd-theme-slim-select`);
      Array.from(selectFilters).forEach(select => {
        const style = document.createElement('style');
        style.textContent = '.ss-main .ss-multi-selected.ss-disabled {background-color: inherit !important;}';
        select.renderRoot.appendChild(style);
      });
    }
  }

  /**
   * @description sets the reportIsEmpty property based on the current report
   * @returns {Boolean} - value of reportIsEmpty
   */
  _setReportIsEmpty(){
    this.reportIsEmpty = true;
    for( const row of this.report ){
      for ( const cell of row ){
        if ( cell.isTotal && !cell.isHeader && cell.value ){
          this.reportIsEmpty = false;
          return this.reportIsEmpty;
        }
      }
    }
    return this.reportIsEmpty;
  }

  /**
   * @description bound to the download report button click event
   * Generates a CSV file from the current report and downloads it
   */
  _onReportDownloadClick(){
    try {
      const data = this.report.map(row => row.map(cell => cell.label));
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], {type: 'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travel-report-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      this.AppStateModel.showToast({
        type: 'error',
        message: 'Error downloading report'
      });
      this.logger.error('Error downloading report', error);
    }
  }

  /**
   * @description @description bound to the approval request view click event
   * - either on report page or pagination on approval requests page
   * @param {Number} page - page number to use in approval request query
   */
  async _onApprovalRequestViewClick(page=1){
    this.approvalRequestPage = page;
    if ( page == 1){
      this.AppStateModel.setLocation('/reports/approval-requests');
    } else {
      this.AppStateModel.refresh();
    }
  }

  /**
   * @description Retrieves approval requests for the selected report filters
   * @returns {Promise} - resolves to the approval requests
   */
  async getApprovalRequests(){
    const query = {
      ...this.selectedFilters,
      approvalStatus: 'approved',
      page: this.approvalRequestPage
    }
    if ( query.employee ){
      query.employees = query.employee;
      delete query.employee;
    }
    if ( this.departmentRestrictions.length && !query.department ) {
      query.department = this.departmentRestrictions;
    }
    return await this.ApprovalRequestModel.query(query);
  }

  /**
   * @description Bound to approval-requests-requested event of ApprovalRequestModel
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onApprovalRequestsRequested(e){
    if ( !this.AppStateModel.isActivePage(this) || e.state !== 'loaded') return;
    this.approvalRequests = e.payload.data;
    this.approvalRequestTotalPages = e.payload.totalPages;
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    const subPageRequested = this.AppStateModel.getPathByIndex(1);
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
    this.departmentRestrictions = accessLevel.payload.departmentRestrictions;

    if ( !accessLevel.payload.hasAccess){
      this.page = this.getPageId('403');
      this.helpUrl = accessLevel.payload.helpUrl;
      this.AppStateModel.showLoaded(this.id);
      return;
    }

    const d = await this.getPageData(subPageRequested);
    this.logger.info('page data fetched', d);
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if ( hasError ) {
      this.AppStateModel.showError(d, {ele: this});
      return;
    }

    this.page = this.getPageId(subPageRequested || 'builder');
    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description fetches all data needed for the page
   * @param {String} subPageRequested - sub page requested
   * @returns
   */
  async getPageData(subPageRequested){
    const promises = [
      this.ReportsModel.getFilters(),
      this.SettingsModel.getByCategory('reports'),
      this.getReport()
    ];

    if ( subPageRequested === 'approval-requests' ) {
      promises.push(this.getApprovalRequests());
    }
    return await Promise.allSettled(promises);
  }

  /**
   * @description Fetches the report data based on the selected filters
   * @returns
   */
  async getReport(){
    const query = {
      metrics: reportUtils.getMetricsFromValues(this.selectedMetrics).map(m => m.urlParam)
    };

    if ( this.selectedAggregatorX ) {
      query['aggregator-x'] = reportUtils.aggregators.find(a => a.value === this.selectedAggregatorX)?.urlParam;
    }
    if ( this.selectedAggregatorY ) {
      query['aggregator-y'] = reportUtils.aggregators.find(a => a.value === this.selectedAggregatorY)?.urlParam;
    }

    for( const filter of reportUtils.filters ){
      if ( this.selectedFilters[filter.value] ) {
        query[filter.urlParam] = this.selectedFilters[filter.value];
      }
    }

    this.logger.info('get report', query);
    return await this.ReportsModel.getReport(query);
  }

  /**
   * @description bound to report-requested event of ReportsModel
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onReportRequested(e){
    if ( !this.AppStateModel.isActivePage(this) ) return;
    if ( e.state === 'loading' ) {
      this.generatingReport = true;
      return;
    }
    this.generatingReport = false;
    if ( e.state === 'error' ) {
      this.AppStateModel.showError(e, {ele: this});
      return;
    }
    if ( e.state === 'loaded' ){
      this.logger.info('report generated', e.payload);
      this.report = e.payload;
    }
  }

  /**
   * @description Returns the subpage id for the given page
   * @param {String} page - page id
   * @returns
   */
  getPageId(page){
    return `${this.id}-page--${page}`;
  }

  /**
   * @description bound to the generate report button click event
   * @returns
   */
  async _onGenerateReportClick(){
    if ( this.generatingReport ) return;
    if ( !this.selectedMetrics.length ) {
      this.AppStateModel.showToast({
        type: 'error',
        message: 'At least one metric must be selected'
      });
      return;
    }
    const r = await this.getReport();
    if ( r.state === 'loaded' ){
      this.AppStateModel.scrollToAnchor(`${this.id}--report-container`) ;
    }
  }

  /**
   * @description bound to reports-filters-fetched event of ReportsModel
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onReportsFiltersFetched(e){
    if ( !this.AppStateModel.isActivePage(this) || e.state !== 'loaded') return;
    this.filters = e.payload;
  }

  /**
   * @description bound to the filter change event of the slim select filters
   * @param {Event} e - Change event from slim select
   * @param {Object} filter - Filter object from this.filters
   */
  _onFilterChange(e, filter){
    this.selectedFilters[filter.type] = e.detail.map(v => filter.isNumber ? Number(v.value) : v.value);
    this.requestUpdate();
  }

  /**
   * @description bound to the help button click event - opens the help dialog
   * @param {String} page - help dialog page to open
   */
  _onHelpClick(page){
    this.helpDialogPage = page;
    document.body.style.overflow = 'hidden';
    this.helpDialogRef.value.showModal();
  }

  /**
   * @description Closes the help dialog
   */
  closeHelpDialog(){
    document.body.style.overflow = '';
    this.helpDialogRef.value.close();
  }

  /**
   * @description Bound to change event for aggregator select elements
   * @param {Event} e - Change event
   * @param {String} axis - 'X' or 'Y'
   * @returns
   */
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

  /**
   * @description Bound to the swap aggregators button click event
   * Swaps the selected aggregators for X and Y axes
   */
  _onAggregatorSwap(){
    const temp = this.selectedAggregatorX;
    this.selectedAggregatorX = this.selectedAggregatorY;
    this.selectedAggregatorY = temp;
  }


}

customElements.define('app-page-reports', AppPageReports);
