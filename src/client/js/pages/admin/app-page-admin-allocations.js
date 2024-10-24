import { LitElement } from 'lit';
import {render} from "./app-page-admin-allocations.tpl.js";
import { createRef } from 'lit/directives/ref.js';
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import fiscalYearUtils from '../../../../lib/utils/fiscalYearUtils.js';
import ValidationHandler from "../../utils/ValidationHandler.js";

/**
 * @class AppPageAdminAllocations
 * @description Admin page for managing employee allocations
 * @property {Array} fundingSourceFilters - list of active funding sources returned from EmployeeAllocationModel
 * @property {Array} employeeFilters - list of employees with at least one allocation returned from EmployeeAllocationModel
 * @property {Array} fiscalYearFilters - list of fiscal years returned from EmployeeAllocationModel
 * @property {Array} selectedFundingSourceFilters - list of selected funding source ids
 * @property {Array} selectedEmployeeFilters - list of selected employee kerberos ids
 * @property {Array} selectedFiscalYearFilters - list of selected fiscal year start years
 * @property {Object} selectedAllocation - selected allocation object for editing
 * @property {Array} allDepartments - list of all departments in the system - for use in the edit form
 * @property {Number} page - current page number of query results
 * @property {Number} maxPage - total number of pages returned by query
 * @property {Array} results - list of employee allocations returned by query
 * @property {String} queryState - loading, loaded, or no-results
 */
export default class AppPageAdminAllocations extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      fundingSourceFilters: {type: Array},
      employeeFilters: {type: Array},
      fiscalYearFilters: {type: Array},
      selectedFundingSourceFilters: {type: Array},
      selectedEmployeeFilters: {type: Array},
      selectedFiscalYearFilters: {type: Array},
      selectedAllocation: {type: Object},
      allDepartments: {type: Array},
      page: {type: Number},
      maxPage: {type: Number},
      results: {type: Array},
      queryState: {type: String},
      updateInProgress: {state: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.fundingSourceFilters = [];
    this.employeeFilters = [];
    this.fiscalYearFilters = [];
    this.page = 1;
    this.resetFilters();
    this.maxPage = 1;
    this.results = [];
    this.queryState = 'loading';
    this.selectedAllocation = {};
    this.updateInProgress = false;
    this.allDepartments = [];

    this.editDialogRef = createRef();
    this.validationHandler = new ValidationHandler();

    this._injectModel('AppStateModel', 'EmployeeAllocationModel', 'DepartmentModel');
  }

  /**
   * @description Reset selected filters to default values
   */
  resetFilters() {
    this.selectedFundingSourceFilters = [];
    this.selectedEmployeeFilters = [];
    this.selectedFiscalYearFilters = [fiscalYearUtils.fromDate().startYear];
  }

  /**
   * @description Query employee allocations using current filter values
   */
  async query(){
    this.queryState = 'loading';
    return await this.EmployeeAllocationModel.query(this._queryObject());
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
    this.logger.info('Page data fetched', d);
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if( hasError ) {
      this.AppStateModel.showError(d, {ele: this});
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
      fiscalYears: this.selectedFiscalYearFilters
    };
  }

  /**
   * @description Get data necessary to render this page
   */
  async getPageData(){
    const promises = [
      this.EmployeeAllocationModel.getFilters(),
      this.query(),
      this.DepartmentModel.queryLocal()
    ];
    const resolvedPromises = await Promise.allSettled(promises);
    return resolvedPromises;
  }

  /**
   * @description bound to EmployeeAllocationModel employee-allocations-requested event
   * Fires any time employee allocations are requested (not just fetched)
   */
  _onEmployeeAllocationsRequested(e) {
    if ( e.state !== 'loaded') return;
    if ( e.query !== this.EmployeeAllocationModel.queryString(this._queryObject()) ) return;
    this.queryState = parseInt(e.payload.total) ? 'loaded' : 'no-results';
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
    this.fiscalYearFilters = fiscalYearUtils.fromStartYears([...e.payload.fiscalYears, fiscalYearUtils.fromDate().startYear]);
  }

  /**
   * @description Event handler for filter changes. Triggers a query to update results
   * @param {Array} options - selected options
   * @param {String} prop - property to update
   * @param {Boolean} toInt - convert values to integers before setting property
   */
  _onFilterChange(options, prop, toInt){
    let values = options.map(option => toInt ? parseInt(option.value) : option.value);
    this[prop] = values;

    this.page = 1;
    this.results = [];
    this.maxPage = 1;

    this.query();

  }

  /**
   * @description Event handler for when the page changes
   */
  _onPageChange(e){
    this.page = e.detail.page;
    this.results = [];
    this.query();
  }

  /**
   * @description Event handler for when the edit button is clicked on an allocation
   * @param {Object} allocation - allocation object to edit
   */
  _onEditClick(allocation){
    this.selectedAllocation = JSON.parse(JSON.stringify(allocation));
    this.validationHandler = new ValidationHandler();
    this.editDialogRef.value.showModal();
  }

  /**
   * @description Event handler for when the edit form is submitted
   * @param {*} e - form submit event
   * @returns
   */
  async _onEditSubmit(e){
    e.preventDefault();
    if ( this.updateInProgress ) return;
    this.updateInProgress = true;

    const r = await this.EmployeeAllocationModel.update(this.selectedAllocation);
    this.updateInProgress = false;
    if ( r.state === 'loaded' ) {
      this.validationHandler = new ValidationHandler();
      this.editDialogRef.value.close();
      this.AppStateModel.refresh();
      setTimeout(() => {
        this.AppStateModel.showToast({message: 'Allocation updated.', type: 'success'});
      }, 1000);
    } else {
      if ( r.error?.payload?.is400 ) {
        this.validationHandler = new ValidationHandler(r);
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when updating the employee allocation. Form data needs fixing.', type: 'error'});
      } else {
        this.AppStateModel.showToast({message: 'An unknown error occurred when updating the employee allocation', type: 'error'});
        this.logger.error('Error updating allocation', r);
      }
    }
  }

  /**
   * @description Sets a property on the selected allocation object
   * @param {String} prop - property name
   * @param {*} value - property value
   */
  setSelectedAllocationProperty(prop, value){
    this.selectedAllocation[prop] = value;
    this.requestUpdate();
  }

  /**
   * @description Bound to DepartmentModel departments-requested event
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onDepartmentsRequested(e){
    if ( e.state !== 'loaded' || !this.AppStateModel.isActivePage(this) ) return;
    this.allDepartments = e.payload;
  }

  /**
   * @description Event handler for when the delete button is clicked on an allocation
   */
  _onDeleteClick(allocation){
    this.AppStateModel.showDialogModal({
      title : 'Delete Allocation',
      content : 'Are you sure you want to delete this employee allocation?',
      actions : [
        {text: 'Delete', value: 'delete-allocation', color: 'double-decker'},
        {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
      ],
      data : {allocation}
    });
  }

  /**
   * @description Callback for dialog-action AppStateModel event
   * @param {Object} e - AppStateModel dialog-action event
   * @returns
   */
  _onDialogAction(e){
    if ( e.action !== 'delete-allocation' ) return;
    const allocation = e.data.allocation;
    const payload = {ids: [allocation.employeeAllocationId]};
    this.EmployeeAllocationModel.delete(payload);
  }

  /**
   * @description Event handler for when employee allocations are deleted.
   * Callback for employee-allocations-deleted event in EmployeeAllocationModel
   */
  async _onEmployeeAllocationsDeleted(e){
    if ( e.state === 'loading' ){
      this.AppStateModel.showLoading();
      return;
    }

    if ( e.state === 'loaded' ){
      await this.query();
      this.AppStateModel.showLoaded(this.id);
      this.AppStateModel.showToast({message: 'Allocation deleted.', type: 'success'});
      return;
    }

    this.AppStateModel.showLoaded(this.id);
    this.AppStateModel.showToast({message: 'Error deleting allocation.', type: 'error'});
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
