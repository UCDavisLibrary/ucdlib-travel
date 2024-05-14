import { LitElement } from 'lit';
import {render} from "./app-page-admin-allocations.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class AppPageAdminAllocations extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      fundingSourceFilters: {type: Array},
      employeeFilters: {type: Array},
      selectedFundingSourceFilters: {type: Array},
      selectedEmployeeFilters: {type: Array},
      selectedDateRangeFilters: {type: Array},
      page: {type: Number},
      maxPage: {type: Number},
      results: {type: Array}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);

    this.fundingSourceFilters = [];
    this.employeeFilters = [];
    this.page = 1;
    this.resetFilters();
    this.maxPage = 1;
    this.results = [];

    this._injectModel('AppStateModel', 'EmployeeAllocationModel');
  }

  /**
   * @description Reset selected filters to default values
   */
  resetFilters() {
    this.selectedFundingSourceFilters = [];
    this.selectedEmployeeFilters = [];
    this.selectedDateRangeFilters = ['current'];
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;

    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Employee Allocations');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    const d = await this.getPageData();
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if( hasError ) {
      this.AppStateModel.showError(d);
      return;
    }
    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Construct query object for EmployeeAllocationModel query from element properties
   */
  _queryObject(){
    return {
      page: this.page,
      fundingSources: this.selectedFundingSourceFilters,
      employees: this.selectedEmployeeFilters,
      dateRanges: this.selectedDateRangeFilters
    };
  }

  /**
   * @description Get data necessary to render this page
   */
  async getPageData(){
    const promises = [];
    promises.push(this.EmployeeAllocationModel.getFilters());
    promises.push(this.EmployeeAllocationModel.query(this._queryObject()));
    const resolvedPromises = await Promise.allSettled(promises);
    return resolvedPromises;
  }

  _onEmployeeAllocationsRequested(e) {
    if ( e.state !== 'loaded') return;
    if ( e.query !== this.EmployeeAllocationModel.queryString(this._queryObject()) ) return;
    this.results = e.payload.data;
    this.maxPage = e.payload.totalPages;
  }

  /**
   * @description bound to EmployeeAllocationModel employee-allocations-filters-fetched event
   * Set fundingSourceFilters and employeeFilters
   */
  _onEmployeeAllocationsFiltersFetched(e) {
    if ( e.state !== 'loaded') return;
    this.fundingSourceFilters = e.payload.fundingSources;
    this.employeeFilters = e.payload.employees;
  }

  /**
   * @description Event handler for filter changes. Triggers a query to update results
   * @param {Array} options - selected options
   * @param {String} prop - property to update
   * @param {Boolean} toInt - convert values to integers before setting property
   */
  _onFilterChange(options, prop, toInt){
    let values = options.map(option => toInt ? parseInt(option.value) : option.value);
    if ( prop === 'selectedDateRangeFilters') {
      if ( values.length === 2 && values.includes('past') && values.includes('future') ) {
        values = [];
        this.AppStateModel.showToast({message: 'Sorry, you cannot display past and future allocations together.', type: 'info'})
      }
    }
    this[prop] = values;

    this.page = 1;
    this.results = [];
    this.maxPage = 1;

    this.EmployeeAllocationModel.query(this._queryObject());

  }

  _onPageChange(e){
    this.page = e.detail.page;
    this.results = [];
    this.EmployeeAllocationModel.query(this._queryObject());
  }

  /**
   * @description Event handler for when employee allocations are created.
   * Callback for employee-allocations-created event in EmployeeAllocationModel
   * @param {Object} e - cork-app-utils event object
   */
  _onEmployeeAllocationsCreated(e){
    if ( e.state !== 'loaded') return;
    this.resetFilters();
    this.page = 1;
    this.results = [];
    this.maxPage = 1;
  }

}

customElements.define('app-page-admin-allocations', AppPageAdminAllocations);
