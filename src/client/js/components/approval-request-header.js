import { LitElement } from 'lit';
import {render} from "./approval-request-header.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import typeTransform from '../../../lib/utils/typeTransform.js';

export default class ApprovalRequestHeader extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequest: {type: Object}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.approvalRequest = {};
  }

  /**
   * @description Get the program dates for the approval request
   * @returns {String}
   */
  getProgramDates(){
    const startDate = typeTransform.toDateFromISO(this.approvalRequest.programStartDate);
    const endDate = typeTransform.toDateFromISO(this.approvalRequest.programEndDate);

    if ( !startDate ) return '';

    if ( !endDate || startDate.getTime() === endDate.getTime() ) {
      return typeTransform.toUtcString(startDate);
    }

    return `${typeTransform.toUtcString(startDate)} - ${typeTransform.toUtcString(endDate)}`;
  }

}

customElements.define('approval-request-header', ApprovalRequestHeader);
