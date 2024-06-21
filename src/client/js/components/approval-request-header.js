import { LitElement } from 'lit';
import {render} from "./approval-request-header.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import typeTransform from '../../../lib/utils/typeTransform.js';
import applicationOptions from '../../../lib/utils/applicationOptions.js';

export default class ApprovalRequestHeader extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequest: {type: Object},
      availableActions: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.approvalRequest = {};
    this.availableActions = [];

    this._injectModel('AuthModel');
  }

  willUpdate(props){
    if (props.has('approvalRequest')) {
      this.availableActions = applicationOptions.getAvailableActions(this.approvalRequest, this.AuthModel.getToken().id);
    }
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

  _onActionClick(action){
    console.log(action);
  }

}

customElements.define('approval-request-header', ApprovalRequestHeader);
