import { LitElement } from 'lit';
import {render} from "./ucdlib-employee-search-advanced.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

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
      results: {type: Array},
      selectedEmployees: {type: Array},
      selectButtonText: {type: String},
      clearOnSelectConfirmation: {type: Boolean},
      _initialized: {state: true},
      _formDisabled: {state: true},
      _searching: {state: true},
      _error: {state: true},
      _didSearch: {state: true},
      _allSelected: {state: true},
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

  async _onFormSubmit(e){
    e.preventDefault();
    if ( this._searching || this._formDisabled ) return;
    this._searching = true;
    this._error = false;
    let results = [];
    let maxPage = 1;
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

  _employeeIsSelected(employee){
    return this.selectedEmployees.some(e => e.user_id === employee.user_id);
  }

  _onEmployeeSelectToggle(employee){
    if( this._employeeIsSelected(employee) ) {
      this.selectedEmployees = this.selectedEmployees.filter(e => e.user_id !== employee.user_id);
    } else {
      this.selectedEmployees = [...this.selectedEmployees, employee];
    }
  }

  _getEmployeeDepartment(employee){
    let out = '';
    for (const group of (employee.groups || [])) {
      if ( group.partOfOrg ) return group.name || '';
    }
    return out;
  }

  _onSelectAllToggle(){}

  _onSelectConfirmation(){
    this.dispatchEvent(new CustomEvent('employee-select', {
      detail: this.selectedEmployees
    }));

    if( this.clearOnSelectConfirmation ) {
      this.selectedEmployees = [];
      this.results = [];
      this._didSearch = false;
    }
  }

}

customElements.define('ucdlib-employee-search-advanced', UcdlibEmployeeSearchAdvanced);
