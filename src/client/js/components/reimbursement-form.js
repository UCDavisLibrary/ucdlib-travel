import { LitElement } from 'lit';
import { createRef } from 'lit/directives/ref.js';
import { render } from "./reimbursement-form.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from '@ucd-lib/theme-elements/utils/controllers/wait.js';

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import ValidationHandler from "../utils/ValidationHandler.js";
import reimbursementExpenses from '../../../lib/utils/reimbursementExpenses.js';

export default class ReimbursementForm extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      reimbursementRequest: {type: Object},
      approvalRequestId: {type: Number},
      parentPageId: {type: String},
      hasTravel: {type: Boolean},
      validationHandler: {type: Object},
      showNewDate: {type: Boolean},
      uniqueDates: {type: Array},
      dateComments: {type: Object},
      approvedExpenses: {type: String},
      otherTotalExpenses: {type: String},
      mileageRate: {type: Number},
      netExpensesNegativeWarningMessage: {type: String},
      totalExpenses: {state: true},
      hasOtherTotalExpenses: {state: true},
      netExpenses: {state: true},
      netExpensesNegative: {state: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.resetForm();

    this.newDateInput = createRef();
    this.form = createRef();
    this.waitController = new WaitController(this);
    this.parentPageId = '';
    this.mileageRate = 0;
    this.approvedExpenses = '0.00';
    this.otherTotalExpenses = '0.00';
    this.netExpenses = '0.00';
    this.netExpensesNegative = false;
    this.netExpensesNegativeWarningMessage = '';


    this._injectModel('AppStateModel', 'ReimbursementRequestModel');

  }

  willUpdate(){
    this.totalExpenses = reimbursementExpenses.addExpenses(this.reimbursementRequest);
    this.hasOtherTotalExpenses = this.otherTotalExpenses !== '0.00';
    this._setNetExpenses();
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

  _setNetExpenses(){
    const credits = parseFloat(this.approvedExpenses);
    const debits = parseFloat(this.totalExpenses) + parseFloat(this.otherTotalExpenses);
    let net = credits - debits;
    if ( net ) {
      this.netExpensesNegative = net < 0;
      net = Math.abs(net).toFixed(2);
    }
    this.netExpenses = net;

  }

  submit(){
    const formData = new FormData(this.form.value);
    for (let key of formData.keys()) {
      if ( key !== 'receiptUploads' ){
        formData.delete(key);
      }
    }
    this.reimbursementRequest.expenses.forEach(expense => {
      if ( !expense.date ) return;
      if ( this.dateComments[expense.date] ){
        expense.notes = this.dateComments[expense.date];
      }

    });
    const reimbursementRequest = {...this.reimbursementRequest, approvalRequestId: this.approvalRequestId};
    formData.append('reimbursementRequest', JSON.stringify(reimbursementRequest));
    this.ReimbursementRequestModel.create(formData);
  }

  _onReimbursementRequestCreated(e){
    if ( !this.AppStateModel.isActivePage(this.parentPageId) ) return;
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        this.validationHandler = new ValidationHandler(e);
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when submitting your reimbursement request. Form data needs fixing.', type: 'error'});
      } else {
        this.AppStateModel.showToast({message: 'An unknown error occurred when submitting your approval request', type: 'error'});
      }
      this.AppStateModel.showLoaded(this.parentPageId);
    } else if ( e.state === 'loading') {
      this.AppStateModel.showLoading();
    } else if ( e.state === 'loaded' ) {
      this.validationHandler = new ValidationHandler();
      this.requestUpdate();
      this.AppStateModel.setLocation(`/approval-request/${this.approvalRequestId}`);
      this.AppStateModel.showToast({message: 'Reimbursement request submitted', type: 'success'});
    }
  }

  /**
   * @description Handle the input event for a property on the reimbursement request
   * @param {String} prop - the property to set
   * @param {*} value - the value to set the property to
   */
  _onInput(prop, value ){
    this.reimbursementRequest[prop] = value;
    this.requestUpdate();
  }

  _onSubmit(e) {
    e.preventDefault();

    // check if any receipts are missing
    let receiptWarningHeader = '';
    let receiptWarningMessage = '';
    if ( !this.reimbursementRequest.receipts.length ) {
      receiptWarningHeader = 'No Receipts';
      receiptWarningMessage = 'You have not uploaded any receipts. Are you sure you want to submit your reimbursement request?';
    }
    if ( this.reimbursementRequest.receipts.find(r => {
      const input = this.renderRoot.querySelector(`#reimbursement-form-receipt--${r.nonce}--file`);
      if ( !input || !input.files.length ) return true;
    })){
      receiptWarningHeader = 'Receipts Missing';
      receiptWarningMessage = 'You have not uploaded all receipts. Are you sure you want to submit your reimbursement request?';
    }
    if ( receiptWarningHeader ) {
      this.AppStateModel.showDialogModal({
        title: receiptWarningHeader,
        content: receiptWarningMessage,
        actions: [
          {text: 'Submit Anyway', 'value': 'no-receipt-confirm', 'color': 'secondary'},
          {text: 'Cancel', 'value': 'cancel', 'invert': true}
        ]
      })
      return;
    }

    this.submit();
  }

  /**
   * @description Callback for dialog-action AppStateModel event
   * @param {Object} e - AppStateModel dialog-action event
   * @returns
   */
  _onDialogAction(e){
    if ( e.action !== 'no-receipt-confirm' ) return;
    this.submit();
  }

  resetForm() {
    this.reimbursementRequest = {
      label: 'Reimbursement Request',
      expenses: [],
      receipts: []
    };
    this.validationHandler = new ValidationHandler();
    this.showNewDate = false;
    this.uniqueDates = [];
    this.dateComments = {};
    this.hasTravel = false;
    this.requestUpdate();
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
   * @param {String} date - optional. the date of the expense for daily expenses
   */
  addBlankExpense(category, subCategory, date){
    const expense = {
      category,
      nonce: Math.random().toString(36).substring(3),
      details: {}
    };
    if ( date ) expense.date = date;
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
   * @description Add a blank receipt record to the reimbursement request
   */
  addBlankReceipt(){
    const receipt = {
      nonce: Math.random().toString(36).substring(3)
    };
    this.reimbursementRequest.receipts.push(receipt);
    this.requestUpdate();
  }

  /**
   * @description Delete a receipt from the reimbursement request
   * @param {Object} receipt - the receipt to delete from reimbursementRequest.receipts
   */
  deleteReceipt(receipt){
    if ( receipt.nonce ){
      this.reimbursementRequest.receipts = this.reimbursementRequest.receipts.filter(r => r.nonce !== receipt.nonce);
    } else if ( receipt.reimbursementRequestReceiptId ){
      this.reimbursementRequest.receipts = this.reimbursementRequest.receipts.filter(r => r.reimbursementRequestReceiptId !== receipt.reimbursementRequestReceiptId);
    }
    this.requestUpdate();
  }

  /**
   * @description bound to the change event for a receipt file input
   * @param {Object} receipt - Object in reimbursementRequest.receipts
   * @param {File} file - the file object from the input
   */
  _onReceiptFileChange(receipt, file){
    let label = file.name;
    if ( label.includes('.') ) {
      label = label.split('.').slice(0, -1).join('.');
    }

    receipt.label = label;
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

  /**
   * @description Handle mileage input for a personal car expense
   * @param {Object} expense - the expense object in reimbursementRequest.expenses
   * @param {String} value - the value of the mileage input
   */
  _onPersonalCarMileageInput(expense, value){
    if ( !expense.details ) expense.details = {};
    value = parseFloat(value);
    value = isNaN(value) ? 0 : value;
    expense.details.estimatedMiles = value;
    let amount = (value || 0) * this.mileageRate;
    if ( amount ) {
      amount = amount.toFixed(2);
    }
    expense.amount = amount;
    this.requestUpdate();
  }

  /**
   * @description Handles the click event for when a new date for a daily expense is added or canceled
   * @param {String} action - 'add' or 'cancel'
   */
  async _onNewDateClick(action){
    this._resetNewDateInput();
    if ( action === 'add' ){
      this.showNewDate = true;
      await this.waitController.waitForUpdate();
      await this.waitController.waitForFrames(2);
      this.newDateInput.value.focus();
      return;
    }
    this.showNewDate = false;
  }

  /**
   * @description Handle the input of a new date in the daily expenses section
   * If valid date,
   * - Add a blank daily expense for that date
   * - Hide the new date input
   * @param {Event} e - date input event
   * @returns
   */
  _onNewDateInput(e){
    const value = e.target.value;
    if ( !value ) return;

    if ( this.uniqueDates.includes(value) ) {
      this.AppStateModel.showToast({message: 'Date already added', type: 'error'})
      return;
    }

    this.addBlankExpense(reimbursementExpenses.dailyExpense.value, null, value);
    this._setUniqueDates();
    this._resetNewDateInput();
    this.showNewDate = false;
  }

  /**
   * @description Reset the value of the new date input in the daily expenses section
   */
  _resetNewDateInput(){
    this.newDateInput.value.value = '';
  }

  /**
   * @description Set the unique dates for daily expenses in the reimbursement request from the expenses array
   */
  _setUniqueDates(){
    const dates = this.reimbursementRequest.expenses.filter(e => e.category === reimbursementExpenses.dailyExpense.value).map(e => e.date);
    this.uniqueDates = [...new Set(dates)];
  }

  /**
   * @description Handle the deletion of a date from the daily expenses section
   * @param {String} date - the date. Format: YYYY-MM-DD
   */
  _onDailyExpenseDateDelete(date){
    this.reimbursementRequest.expenses = this.reimbursementRequest.expenses.filter(e => e.date !== date);
    this._setUniqueDates();
    this.requestUpdate();
  }

  /**
   * @description Handle the input of a date for an existing daily expense
   * Updates all daily expenses with the old date to the new date
   * @param {String} oldDate - the old date. Format: YYYY-MM-DD
   * @param {String} newDate - the new date. Format: YYYY-MM-DD
   */
  _onDailyExpenseDateInput(oldDate, newDate){
    this.reimbursementRequest.expenses.forEach(e => {
      if ( e.date === oldDate ) e.date = newDate;
    });
    this._setUniqueDates();
    this.requestUpdate();
  }

}

customElements.define('reimbursement-form', ReimbursementForm);
