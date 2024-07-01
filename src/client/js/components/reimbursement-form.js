import { LitElement } from 'lit';
import {render} from "./reimbursement-form.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import ValidationHandler from "../utils/ValidationHandler.js";

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




}

customElements.define('reimbursement-form', ReimbursementForm);
