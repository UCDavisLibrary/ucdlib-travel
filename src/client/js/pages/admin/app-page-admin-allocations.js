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
      selectedDateRangeFilters: {type: Array}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);

    this.fundingSourceFilters = [];
    this.employeeFilters = [];
    this.selectedFundingSourceFilters = [];
    this.selectedEmployeeFilters = [];
    this.selectedDateRangeFilters = ['current'];

    this._injectModel('AppStateModel', 'EmployeeAllocationModel');
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
   * @description Get data necessary to render this page
   */
  async getPageData(){
    const promises = [];
    promises.push(this.EmployeeAllocationModel.getFilters());
    const resolvedPromises = await Promise.allSettled(promises);
    return resolvedPromises;
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
   * @description bound to change event on date range filters select
   */
  _onDateRangeFiltersChange(e) {
    let ranges = e.detail.map(option => option.value);
    if ( ranges.length === 2 && ranges.includes('past') && ranges.includes('future') ) {
      ranges = [];
      this.AppStateModel.showToast({message: 'Sorry, you cannot display past and future allocations together.', type: 'information'})
    }
    this.selectedDateRangeFilters = ranges;
  }

}

customElements.define('app-page-admin-allocations', AppPageAdminAllocations);
