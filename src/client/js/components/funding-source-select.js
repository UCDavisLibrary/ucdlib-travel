import { LitElement } from 'lit';
import { render } from "./funding-source-select.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";

/**
 * @class FundingSourceSelect
 * @description Component that either
 * 1. Displays a list of funding sources with amounts and descriptions
 * 2. Displays a form for editing funding sources
 *
 * @property {Array} data - Array of funding source objects
 * @property {String} label - Label for the component
 * @property {Number} expenditureTotal - Total expenditure amount - used to validate funding source amounts
 * @property {Boolean} formView - Whether to display the form view
 * @property {Boolean} canToggleView - Whether the view can be toggled by the user
 * @property {Boolean} reallocateOnly - Whether the user can only reallocate funds (not add or remove sources)
 * @property {String} customError - Custom error message to display
 * @property {Boolean} alwaysShowOne - Whether to always show one funding source in the form view
 * @property {Array} activeFundingSources - State property - Array of active funding sources from the server
 * @property {Number} fundingSourceTotal - State property - Total funding amount from the data array
 * @property {Boolean} hasError - State property - Whether the form has an error
 * @property {String} errorMessage - State property - Error message to display
 */
export default class FundingSourceSelect extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      data: {type: Array},
      label: {type: String},
      expenditureTotal: {type: Number, attribute: 'expenditure-total'},
      formView: {type: Boolean, attribute: 'form-view'},
      canToggleView: {type: Boolean, attribute: 'can-toggle-view'},
      reallocateOnly: {type: Boolean, attribute: 'reallocate-only'},
      customError: {type: String, attribute: 'custom-error'},
      alwaysShowOne: {type: Boolean, attribute: 'always-show-one'},
      indentBody: {type: Boolean, attribute: 'indent-body'},
      activeFundingSources: {type: Array, state: true},
      fundingSourceTotal: {type: Number, state: true},
      hasError: {type: Boolean, state: true},
      errorMessage: {type: String, state: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.formView = false;
    this.canToggleView = false;
    this.expenditureTotal = 0;
    this.reallocateOnly = false;
    this.customError = '';
    this.label = 'Funding Sources';
    this.alwaysShowOne = false;
    this.indentBody = false;

    this.activeFundingSources = [];
    this.data = [];

    this._injectModel('FundingSourceModel');
  }

  /**
   * @description Lit lifecycle method callback
   * @param {Map} props - changed properties
   */
  willUpdate(props){
    if ( props.has('data') ) {
      this._setFundingSourceTotal();

      if ( this.alwaysShowOne && this.data.length === 0 ){
        this._pushBlankFundingSource();
      }
    }

    this._setErrorState(props);
  }

  /**
   * @description Sets the total funding amount from the data array
   */
  _setFundingSourceTotal(){
    this.fundingSourceTotal = this.data.reduce((total, source) => {
      return total + source.amount;
    }, 0);
  }

  /**
   * @description Set form error state based on current properties
   * @param {Map} props - changed props
   * @returns
   */
  _setErrorState(props){
    const watched = ['expenditureTotal', 'fundingSourceTotal', 'customError', 'formView' ];
    if ( !watched.some(prop => props.has(prop)) ) return;

    if ( !this.formView ){
      this.hasError = false;
      return;
    }

    if ( this.customError ){
      this.hasError = true;
      this.errorMessage = this.customError;
      return;
    }

    if ( this.expenditureTotal !== this.fundingSourceTotal ) {
      this.hasError = true;
      this.errorMessage = `Total funding amount must equal total expenditure amount of $${this.expenditureTotal.toFixed(2)}`;
      return;
    }

    this.hasError = false;
    this.errorMessage = '';

  }


  /**
   * @description Attached to input events on funding sources when in form view
   * @param {Object} fundingSource - A funding source object from the data property array
   * @param {String} prop - name of property to update
   * @param {*} value - value to update property with
   */
  async _onFundingSourceInput(fundingSource, prop, value){
    if (prop === 'fundingSourceId') {
      value = parseInt(value);
      fundingSource.description = '';
      fundingSource.requireDescription = this.activeFundingSources.find(source => source.fundingSourceId === value).requireDescription;
    }
    if ( prop === 'amount' ) {
      value = Number(value);
    }
    fundingSource[prop] = value;

    this._setFundingSourceTotal();
    this.requestUpdate();
    await this.updateComplete;

    this._dispatchEvent();
  }

  /**
   * @description Attached to add click event on funding source
   * @returns
   */
  _onAddClick(){
    if ( this.reallocateOnly ) return;
    this._pushBlankFundingSource();
    this.requestUpdate();

  }

  /**
   * @description Attached to delete click event on funding source
   * Removes a funding source from the data array
   * @param {Number} index - index of funding source to remove
   */
  async _onDeleteClick(index){
    if ( this.reallocateOnly ) return;
    this.data.splice(index, 1);

    this._setFundingSourceTotal();
    this.requestUpdate();
    await this.updateComplete;

    this._dispatchEvent();


    if ( index === 0 && this.alwaysShowOne ) {
      this._pushBlankFundingSource();
    }
  }

  /**
   * @description Attached to toggle view click event
   * @returns {Boolean}
   */
  _onToggleViewClick(){
    if ( !this.canToggleView ) return;
    this.formView = !this.formView;
  }

  /**
   * @description Add a blank funding source to the data array - for editing interface
   */
  _pushBlankFundingSource(){
    this.data.push({
      fundingSourceId: null,
      amount: 0,
      description: '',
      requireDescription: false
    });
  }

  /**
   * @description Dispatch funding-source-input event
   */
  _dispatchEvent(){
    this.dispatchEvent(new CustomEvent('funding-source-input', {
      bubbles: true,
      composed: true,
      detail: {
        fundingSources: this.data,
        hasError: this.hasError
      }
    }));
  }

  /**
   * @description Retrieve necessary data for component
   * @returns {Promise}
   */
  async init(){
    const promises = [
      this.FundingSourceModel.getActiveFundingSources()
    ];

    return await Promise.allSettled(promises);
  }

  /**
   * @description Attached to active-funding-sources-fetched event from FundingSourceModel
   * Fires when active funding sources are fetched from the server
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onActiveFundingSourcesFetched(e) {
    if ( e.state !== 'loaded' ) return;
    this.activeFundingSources = e.payload.filter(source => source.fundingSourceId !== 8);
  }

}

customElements.define('funding-source-select', FundingSourceSelect);
