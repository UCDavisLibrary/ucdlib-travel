import { LitElement } from 'lit';
import {render} from "./ucdlib-employee-search-advanced.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

/**
 * @description Advanced employee search component.
 * Allows for searching the Library personnel database by name, department, and title code.
 * And selecting multiple employees to add to a list.
 * @param {Array} departments - array of department objects retrieved from DepartmentModel
 * @param {Array} titleCodes - array of title code objects retrieved from EmployeeModel
 * @param {Array} selectedDepartments - array of selected department ids
 * @param {Array} selectedTitleCodes - array of selected title codes
 * @param {String} employeeName - search input for employee name
 * @param {Number} page - current page number of search results
 * @param {Number} maxPage - total number of pages of search results
 * @param {Array} results - array of employee objects returned from search
 * @param {Array} selectedEmployees - array of selected employee objects
 * @param {String} selectButtonText - text for the select confirmation button at the bottom of the component
 * @param {Boolean} clearOnSelectConfirmation - clear form and results on select confirmation
 * @param {Boolean} _initialized - component initialization status
 * @param {Boolean} _formDisabled - form is disabled
 * @param {Boolean} _searching - search is in progress
 * @param {Boolean} _error - error occurred during previous search
 * @param {Boolean} _didSearch - search has been performed
 * @param {Boolean} _allSelected - all displayed employees are selected
 */
export default class UcdlibEmployeeSearchAdvanced extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      departments: {type: Array},
      titleCodes: {type: Array},
      selectedDepartments: {type: Array},
      selectedTitleCodes: {type: Array},
      employeeName: {type: String},
      page: {type: Number},
      maxPage: {type: Number},
      results: {type: Array},
      selectedEmployees: {type: Array},
      selectButtonText: {type: String},
      clearOnSelectConfirmation: {type: Boolean},
      _initialized: {state: true},
      _formDisabled: {state: true},
      _searching: {state: true},
      _error: {state: true},
      _didSearch: {state: true},
      _allSelected: {state: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.departments = [];
    this.titleCodes = [];
    this.selectedDepartments = [];
    this.selectedTitleCodes = [];
    this.page = 1;
    this.maxPage = 1;
    this.employeeName = '';
    this.results = [];
    this.selectedEmployees = [];
    this._initialized = false;
    this._formDisabled = false;
    this._searching = false;
    this._error = false;
    this._didSearch = false;
    this.selectButtonText = 'Select';
    this.clearOnSelectConfirmation = false;
    this._allSelected = false;

    this._injectModel('EmployeeModel', 'DepartmentModel');
  }

  /**
   * @description Lit lifecycle hook
   * @param {Map} changedProps - updated properties
   */
  willUpdate(changedProps) {

    // disable form if no search criteria or already searching
    let props = ['selectedDepartments', 'selectedTitleCodes', 'employeeName', '_searching'];
    if( props.some(prop => changedProps.has(prop)) ) {
      this._formDisabled = this._searching || (!this.employeeName && !this.selectedDepartments.length && !this.selectedTitleCodes.length);
    }

    props = ['selectedEmployees', 'results'];
    if( props.some(prop => changedProps.has(prop)) ) {
      const resultsIds = new Set(this.results.map(e => e.user_id));
      const selectedIds = new Set(this.selectedEmployees.map(e => e.user_id));
      this._allSelected = this.results.length && [...resultsIds].every(id => selectedIds.has(id));
    }
  }

  /**
   * @description Initialize the component. Fetches data required for rendering filter selects.
   * @returns {Promise} - returns array of cork-app-state promises e.g. {status: 'fulfilled', value: {state: 'loaded', payload: {}}
   */
  async init(){

    this._initialized = 'loading';

    const promises = [
      this.DepartmentModel.getActiveDepartments(),
      this.EmployeeModel.getActiveTitles()
    ];

    const resolvedPromises = await Promise.allSettled(promises);
    const hasError = resolvedPromises.some(e => e.status === 'rejected' || e.value.state === 'error');
    if( hasError ) {
      this._initialized = 'error';
      return resolvedPromises;
    }

    this.departments = resolvedPromises[0].value.payload;
    const titleCodes = resolvedPromises[1].value.payload;
    titleCodes.sort((a, b) => {
      if( a.titleDisplayName < b.titleDisplayName ) return -1;
      if( a.titleDisplayName > b.titleDisplayName ) return 1;
      return 0;
    });
    this.titleCodes = titleCodes;
    this._initialized = true;

    return resolvedPromises;
  }

  /**
   * @description Handle form submission. Queries the employee model with the form data.
   * @param {Event} e - form submit event
   * @returns
   */
  async _onFormSubmit(e){
    e.preventDefault();
    if ( this._searching || this._formDisabled ) return;
    this._searching = true;
    this._error = false;
    let results = [];
    let maxPage = 1;
    this.page = 1;
    this._didSearch = false;

    try {
      const response = await this.EmployeeModel.queryIam(this.getQueryObject());
      if ( response.state === 'loaded' ) {
        results = response.payload.data;
        maxPage = response.payload.totalPages;
      } else {
        this._error = true;
      }
    } catch(e) {
      console.error(e);
      this._error = true;
    }

    this._searching = false;
    this.results = results;
    this.maxPage = maxPage;
    this._didSearch = true;
    this.selectedEmployees = [];
  }

  /**
   * @description Get the query object for EmployeeModel.queryIam
   * @returns {Object}
   */
  getQueryObject(){
    const q = {};
    if( this.employeeName ) q.name = this.employeeName;
    if( this.selectedDepartments.length ) q.department = this.selectedDepartments;
    if( this.selectedTitleCodes.length ) q.titleCode = this.selectedTitleCodes;
    if( this.page ) q.page = this.page;
    return q;
  }

  /**
   * @description Check if an employee is selected
   * @param {Object} employee - employee object retrieved from model
   * @returns {Boolean}
   */
  _employeeIsSelected(employee){
    return this.selectedEmployees.some(e => e.user_id === employee.user_id);
  }

  /**
   * @description Handle individual employee select toggle
   * @param {Object} employee - employee object retrieved from model
   */
  _onEmployeeSelectToggle(employee){
    if( this._employeeIsSelected(employee) ) {
      this.selectedEmployees = this.selectedEmployees.filter(e => e.user_id !== employee.user_id);
    } else {
      this.selectedEmployees = [...this.selectedEmployees, employee];
    }
  }

  /**
   * @description Get the department name of an employee
   * @param {Object} employee - employee object retrieved from model
   * @returns {String}
   */
  _getEmployeeDepartment(employee){
    let out = '';
    for (const group of (employee.groups || [])) {
      if ( group.partOfOrg ) return group.name || '';
    }
    return out;
  }

  /**
   * @description Handle select all toggle. Removes or adds all displayed employees to selectedEmployees array
   */
  _onSelectAllToggle(){
    const displayedEmployeeIds = this.results.map(e => e.user_id);

    if ( this._allSelected ) {
      this.selectedEmployees = this.selectedEmployees.filter(e => !displayedEmployeeIds.includes(e.user_id));
    } else {
      const newlySelectedEmployees = this.results.filter(e => !this._employeeIsSelected(e));
      this.selectedEmployees = [...this.selectedEmployees, ...newlySelectedEmployees];
    }
  }

  /**
   * @description Handle "Add" button click. Dispatches employee-select event with selected employees
   */
  _onSelectConfirmation(){
    this.dispatchEvent(new CustomEvent('employee-select', {
      detail: this.selectedEmployees
    }));

    if( this.clearOnSelectConfirmation ) {
      this.selectedEmployees = [];
      this.results = [];
      this._didSearch = false;
      this.clearForm();
    }
  }

  /**
   * @description Clear form inputs
   */
  clearForm(){
    this.employeeName = '';
    this.selectedDepartments = [];
    this.selectedTitleCodes = [];
  }

  /**
   * @description Handle pagination change. Queries the employee model with the new page number
   * @param {Number} newPage - new page number
   * @returns
   */
  async _onPaginationChange(newPage){
    if ( this._searching ) return;

    this._searching = true;
    this._error = false;
    let results = [];
    let maxPage = 1;
    this.page = newPage;
    this._didSearch = false;

    try {
      const response = await this.EmployeeModel.queryIam(this.getQueryObject());
      if ( response.state === 'loaded' ) {
        results = response.payload.data;
        maxPage = response.payload.totalPages;
      } else {
        this._error = true;
      }
    } catch(e) {
      console.error(e);
      this._error = true;
    }

    this._searching = false;
    this.results = results;
    this.maxPage = maxPage;
    this._didSearch = true;
  }

}

customElements.define('ucdlib-employee-search-advanced', UcdlibEmployeeSearchAdvanced);
