import { LitElement } from 'lit';
import {render} from "./reimbursement-form.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import ValidationHandler from "../utils/ValidationHandler.js";
import reimbursmentExpenses from '../../../lib/utils/reimbursmentExpenses.js';

export default class ReimbursementForm extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      reimbursementRequest: {type: Object},
      validationHandler: {type: Object}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.resetForm();

  }

  setDatesFromApprovalRequest(approvalRequest){
    if ( !approvalRequest ) return;

    if ( approvalRequest.travelStartDate ){
      this.reimbursementRequest.travelStart = approvalRequest.travelStartDate;
    } else if ( approvalRequest.programStartDate ){
      this.reimbursementRequest.travelStart = approvalRequest.programStartDate;
    }

    if ( approvalRequest.travelEndDate ){
      this.reimbursementRequest.travelEnd = approvalRequest.travelEndDate;
    } else if ( approvalRequest.programEndDate ){
      this.reimbursementRequest.travelEnd = approvalRequest.programEndDate;
    }

    this.requestUpdate();
  }

  _onInput(prop, value ){
    this.reimbursementRequest[prop] = value;
    this.requestUpdate();
  }

  _onDateInput(prop, value){
    const time = this.getTime(prop);
    this.reimbursementRequest[prop] = `${value}${time ? 'T'+time : ''}`;
    this.requestUpdate();
  }

  _onTimeInput(prop, value){
    const date = this.getDate(prop);
    this.reimbursementRequest[prop] = `${date}T${value}`;
    this.requestUpdate();
  }

  _onSubmit(e) {
    e.preventDefault();
    console.log('submit', this.reimbursementRequest);
  }

  resetForm() {
    this.reimbursementRequest = {
      label: 'Reimbursement Request',
      expenses: []
    };
    this.validationHandler = new ValidationHandler();
    this.requestUpdate();
  }

  /**
   * @description Get the date from a date time iso string reimbursementRequest property
   * @param {String} prop - the reimbursementRequest property to get date from
   * @returns {String} date in YYYY-MM-DD format
   */
  getDate(prop){
    const iso = this.reimbursementRequest[prop];
    if ( !iso || iso.startsWith('T')) return '';
    return iso.split('T')[0];
  }

  /**
   * @description Get the time from a date time iso string reimbursementRequest property
   * @param {String} prop - the reimbursementRequest property to get time from
   * @returns {String} time in HH:MM format
   */
  getTime(prop){
    const iso = this.reimbursementRequest[prop];
    if ( !iso || !iso.includes('T')) return '';
    let time = iso.split('T')[1];
    return time.split(':').slice(0,2).join(':');
  }

  /**
   * @description Check if an expense exists for a category or subcategory
   * @param {String} category - the category of the expense
   * @param {String} subCategory - optional. the subcategory of the expense
   * @returns {Boolean}
   */
  hasExpense(category, subCategory){
    const expenses = (this.reimbursementRequest.expenses || []).filter(e => e.category === category);
    if ( !subCategory ) return expenses.length > 0;
    return expenses.find(e => (e.details || {}).subCategory === subCategory);
  }

  /**
   * @description Toggle data for an expense category.
   * If the category is not in the reimbursement request, add a blank expense.
   * If the category is in the reimbursement request, remove all expenses for that category.
   * @param {String} category - the category of the expense
   * @param {String} subCategory - optional. the subcategory of the expense
   */
  _onExpenseCategoryToggle(category, subCategory){
    if ( this.hasExpense(category, subCategory) ){
      if ( subCategory ){
        this.reimbursementRequest.expenses = this.reimbursementRequest.expenses.filter(e => !(e.category === category && (e.details || {}).subCategory === subCategory));
      } else {
        this.reimbursementRequest.expenses = this.reimbursementRequest.expenses.filter(e => e.category !== category);
      }
      this.requestUpdate();
    } else {
      this.addBlankExpense(category, subCategory);
    }
  }

  /**
   * @description Add a blank expense to the reimbursement request
   * @param {String} category - the category of the expense
   * @param {String} subCategory - optional. the subcategory of the expense
   */
  addBlankExpense(category, subCategory){
    const expense = {
      category,
      nonce: Math.random().toString(36).substring(3),
      details: {}
    };
    if ( subCategory ) expense.details = {subCategory};
    this.reimbursementRequest.expenses.push(expense);
    this.requestUpdate();
  }

  /**
   * @description Delete an expense from the reimbursement request
   * @param {Object} expense - the expense to delete from reimbursementRequest.expenses
   */
  deleteExpense(expense){
    if ( expense.nonce ){
      this.reimbursementRequest.expenses = this.reimbursementRequest.expenses.filter(e => e.nonce !== expense.nonce);
    } else if ( expense.reimbursementRequestExpenseId ){
      this.reimbursementRequest.expenses = this.reimbursementRequest.expenses.filter(e => e.reimbursementRequestExpenseId !== expense.reimbursementRequestExpenseId);
    }
    this.requestUpdate();
  }

  /**
   * @description Set a property on an object and request an update
   * @param {Object} object - the object to set the property on
   * @param {String} prop - the property to set
   * @param {*} value - the value to set the property to
   */
  _setObjectProperty(object, prop, value){
    object[prop] = value;
    this.requestUpdate();
  }





}

customElements.define('reimbursement-form', ReimbursementForm);
