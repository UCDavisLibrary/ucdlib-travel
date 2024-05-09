import { LitElement } from 'lit';
import {render} from "./app-page-admin-allocations-new.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";
import { createRef } from 'lit/directives/ref.js';
import IamEmployeeObjectAccessor from '../../../../lib/utils/iamEmployeeObjectAccessor.js';

export default class AppPageAdminAllocationsNew extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      employees: {type: Array},
      startDate: {type: String},
      endDate: {type: String},
      fundingAmount: {type: Number},
      fundingSources: {type: Array},
      selectedFundingSource: {type: Object}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.fundingSources = [];
    this.resetForm();

    this.employeeSearchRef = createRef();
    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'FundingSourceModel', 'EmployeeAllocationModel');
  }

  /**
   * @description Reset form state
   */
  resetForm(){
    this.employees = [];
    this.startDate = '';
    this.endDate = '';
    this.fundingAmount = 0;
    this.selectedFundingSource = {};
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;

    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Add Employee Allocations');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
      this.AppStateModel.store.breadcrumbs['admin-allocations'],
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
    this.requestUpdate();
  }

  /**
   * @description Event handler for when an employee is removed from the list
   * @param {Object} employee - employee object
   */
  _onRemoveEmployee(employee){
    this.employees = this.employees.filter(e => e.kerberos !== employee.kerberos);
  }

  /**
   * @description Event handler for when employees are selected from the employee search component
   * @param {CustomEvent} e - employee-select event from ucdlib-employee-search-advanced
   */
  _onEmployeeSelect(e) {
    const newEmployees = [];
    for( let employee of e.detail ) {
      employee = (new IamEmployeeObjectAccessor(employee)).travelAppObject;
      if( this.employeeIsSelected(employee) ) continue;
      newEmployees.push(employee);
    }
    this.employees = [...this.employees, ...newEmployees];
  }

  /**
   * @description Check if an employee is already in the selected list
   * @param {Object} employee - employee object
   * @returns
   */
  employeeIsSelected(employee) {
    return this.employees.find(e => e.kerberos === employee.kerberos);
  }

  /**
   * @description Event handler for form submission
   * @param {Event} e - Submit event
   */
  async _onFormSubmit(e) {
    e.preventDefault();
    const payload = {
      startDate: this.startDate,
      endDate: this.endDate,
      fundingSourceId: this.selectedFundingSource.fundingSourceId,
      amount: this.fundingAmount,
      employees: this.employees
    };
    console.log('submit', payload);
    await this.EmployeeAllocationModel.createEmployeeAllocations(payload);

  }

  /**
   * @description Event handler for form input fields
   * @param {String} prop - property name
   * @param {*} value - input value
   */
  _onFormInput(prop, value){
    if ( prop === 'fundingAmount' ) value = Number(value);
    this[prop] = value;
    this.requestUpdate();
  }

  /**
   * @description Event handler for when a funding source is selected
   * @param {Object} fundingSourceId - funding source id
   * @returns
   */
  _onFundingSourceSelect(fundingSourceId){
    const fundingSource = this.fundingSources.find(f => f.fundingSourceId == fundingSourceId);
    if ( !fundingSource ) {
      this.selectedFundingSource = {};
      this.fundingAmount = 0;
      return;
    }
    this.selectedFundingSource = fundingSource;
    this.fundingAmount = fundingSource.capDefault ? Number(fundingSource.capDefault) : 0;
  }

  /**
   * @description Attached to active-funding-sources-fetched event from FundingSourceModel
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onActiveFundingSourcesFetched(e){
    if ( e.state !== 'loaded' ) return;
    this.fundingSources = e.payload;
  }

  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){

    // need to ensure that employee search has been rendered before we can initialize it
    await this.waitController.waitForUpdate();

    const promises = [];
    promises.push(this.employeeSearchRef.value.init());
    promises.push(this.FundingSourceModel.getActiveFundingSources());
    const resolvedPromises = await Promise.allSettled(promises);

    // flatten resolved promises - employee search returns an array of promises
    const out = [];
    resolvedPromises.forEach(p => {
      if ( Array.isArray(p.value) ) {
        out.push(...p.value);
      } else {
        out.push(p);
      }
    });
    return out;

  }

}

customElements.define('app-page-admin-allocations-new', AppPageAdminAllocationsNew);
