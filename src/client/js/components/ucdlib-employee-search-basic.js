import { LitElement } from 'lit';
import {render } from "./ucdlib-employee-search-basic.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";


/**
 * @description Advanced employee search component.
 * Allows for searching the Library personnel database by name.
 * And selecting employees to add to a field.
 * @param {String} query - string entered into the search input field
 * @param {String} labelText - string text label property for the search input field
 * @param {Boolean} hideLabel - state of label visibility
 * @param {Array} results - array of employee objects returned from search
 * @param {Number} totalResults - total number of employees returned from search.payload.data.length
 * @param {Number} resultCtNotShown - difference of payload.total and payload.data.length. Checks that all results are shown.
 * @param {Boolean} noResults - total number of pages of search results. true is payload.data.length is 0
 * @param {Boolean} error - true if component state is 'error'
 * @param {String} status - status of input component. 'idle', 'searching', 'no-results', 'selected' bound to setStatus method
 * @param {Boolean} isSearching - text is entered into the search input field and searching for results
 * @param {Boolean} showDropdown - component initialization status. True if search results are shown and more than three charecters are entered into the search input field
 * @param {Boolean} isFocused - form is focused. True if search input field is focused. Triggered by @focus event.
 * @param {String} selectedText - Text in dropdown after a result is selected.
 * @param {Object} selectedObject - Full result of search object after a result is selected.
 * @param {String} department - sorted department name from the search result object
 * @param {String} selectedValue - kerberos id from the search result object
 *
 * @emits status-change - Fires when user updates the status of the search element
 * @emits employee-selected - Fires when user selects an employee from the search results
 */

export default class UcdlibEmployeeSearchBasic extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      query: {type: String},
      labelText: {type: String, attribute: 'label-text'},
      hideLabel: {type: Boolean, attribute: 'hide-label'},
      selectedValue: {type: String, attribute: 'selected-value'},
      results: {state: true},
      totalResults: {state: true},
      resultCtNotShown: {state: true},
      noResults: {state: true},
      error: {state: true},
      status: {state: true},
      isSearching: {state: true},
      showDropdown: {state: true},
      isFocused: {state: true},
      selectedText: {state: true},
      selectedObject: {state: true},
      iamRecordMissing: {state: true}
      }
    }

  constructor() {
    super();
    this.render = render.bind(this);
    this.query = '';
    this.results = [];
    this.totalResults = 0;
    this.resultCtNotShown = 0;
    this.error = false;
    this.labelText = 'Search for a UC Davis Library Employee';
    this.hideLabel = false;
    this.status = 'idle';
    this.isSearching = false;
    this.showDropdown = false;
    this.isFocused = false;
    this.noResults = false;
    this.selectedText = '';
    this.selectedObject = {};
    this.department = '';
    this.selectedValue = '';

    this._injectModel('EmployeeModel');
  }

    /**
   * @description LitElement lifecycle called when element is updated
   * @param {*} p - Changed properties
   */
    async willUpdate(p) {
      if ( p.has('query') && this.query.length > 2 ){
        if ( this.searchTimeout ) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.search();
        }, 500);
      }

      if ( p.has('results') || p.has('totalResults') ) {
        this.resultCtNotShown = this.totalResults - this.results.length;
      }

      await this._getEmployeeRecordByAttribute(p);

      this._setStatus(p);
      this._setShowDropdown(p);
    }

    /**
     * @description Attached to input event on main search input field
     * @param {Event} e - input event
     */
    _onInput(e) {
      this.query = e.target.value;
      this.selectedText = '';
      this.selectedObject = {};
      this.selectedValue = '';
    }

    /**
     * @description Searches for employees by name. Fires when query property changes.
     * @returns
     */
    async search(){
      this.noResults = false;
      this.iamRecordMissing = false;
      this.selectedText = '';
      this.selectedObject = {};
      this.selectedValue = '';
      if ( !this.query ) {
        this.results = [];
        this.totalResults = 0;
        this.error = false;
        return;
      }
      this.isSearching = true;
      const r = await this.EmployeeModel.queryIam({name: this.query});
      this.isSearching = false;
      if ( r.state === 'loaded' ) {
        this.results = r.payload.data;
        this.totalResults = r.payload.total;
        this.noResults = !this.results.length;
        this.error = false;
      }
      if ( r.state === 'error' ) {
        this.error = true;
      }
    }

    /**
     * @description Fetches the employee record by the selectedValue attribute
     * Attached to willUpdate lifecycle callback
     * Will activate when selectedValue element attribute changes
     * @param {Map} p - Properties that have changed in current update cycle
     */
    async _getEmployeeRecordByAttribute(p){
      if (p.has('selectedValue') &&
        this.selectedValue !== this.selectedObject.user_id ) {

        if ( !this.selectedValue ) {
          this.selectedObject = {};
          this.selectedText = '';
          this.query = '';
          return;
        }

        let iamObject = await this.EmployeeModel.getIamRecordById(this.selectedValue);
        this.iamRecordMissing = false;
        if ( iamObject.state === 'loaded' ){
          this._onSelect(iamObject.payload);
          this.error = false;
        } else if ( iamObject.state === 'error' ){
          this.error = true;
          this.selectedObject = {};
          this.selectedText = '';

          if ( iamObject.error?.response?.status == 404 ){
            this.iamRecordMissing = true;
          }
        }
      }

    }

    /**
     * @description Sets the status of the element based on the updated properties
     * @param {*} p - Changed properties
     */
    _setStatus(p){
      if ( p.has('isSearching') || p.has('query') || p.has('noResults') || p.has('selectedText') ){
        const detail = {status: this.status};
        let status = 'idle';
        if ( this.isSearching ) {
          status = 'searching';
        } else if ( this.noResults ){
          status = 'no-results';
        } else if ( this.selectedText ){
          status = 'selected';
          detail.employee = this.selectedObject;
        }
        this.status = status;

        this.dispatchEvent(new CustomEvent('status-change', {
          detail: detail
        }));
      }
    }

    /**
     * @description Shows/hides the results dropdown based on the element's updated properties
     * @param {*} p
     */
    _setShowDropdown(p){
      if ( p.has('isFocused') || p.has('results') || p.has('query') || p.has('selectedText')){
        this.showDropdown = this.isFocused && this.results.length && this.query && !this.selectedText;
      }
    }

    /**
     * @description Fires when a result is clicked from the dropdown
     * @param {Object} result - an Employee object from the database
     */
    async _onSelect(result, emitEvent){
      if ( !result ){
        this.selectedValue = '';
        this.selectedObject = {};
        this.selectedText = '';
        return;
      }
      this.selectedValue = result.user_id;
      this.selectedObject = result;
      this.selectedText = `${result.first_name} ${result.last_name}`;

      if ( emitEvent ) {
        this.dispatchEvent(new CustomEvent('employee-selected', {
          detail: {employee: result}
        }));
      }
    }

    /**
     * @description Hides dropdown box on input blur.
     * Must give time for click event to fire on dropdown item.
     */
    _onBlur(){
      setTimeout(() => {
        this.isFocused = false;
      }, 250);
    }


    /**
     * @description searches for employee department
     * @param {Object} result - an Employee object from the database
     */
    getDepartment(result){
      if ( result.groups ) {
        let department = result.groups.find(group => group.type === 'Department');
        if ( department ) return department.name;
      }
      return '';
    }

}

customElements.define('ucdlib-employee-search-basic', UcdlibEmployeeSearchBasic);
