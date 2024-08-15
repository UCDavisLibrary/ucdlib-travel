import { LitElement } from 'lit';
import {render} from "./approval-request-details.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import typeTransform from '../../../lib/utils/typeTransform.js';

/**
 * @class ApprovalRequestDetails
 * @description Component that displays the details of an approval request
 * @property {Object} approvalRequest - The approval request object
 */
export default class ApprovalRequestDetails extends Mixin(LitElement)
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
   * @description Get first and last name of the employee
   * @returns {String}
   */
  getEmployeeName(){
    return `${this.approvalRequest.employee?.firstName || ''} ${this.approvalRequest.employee?.lastName || ''}`;
  }

  /**
   * @description Get the location for the approval request
   * @returns {String}
   */
  getLocation(){
    const locations = {
      'in-state': 'In State',
      'out-of-state': 'Out of State',
      'foreign': 'Foreign',
      'virtual': 'Virtual'
    };
    const location = locations[this.approvalRequest.location] || this.approvalRequest.location;
    return `${location}${this.approvalRequest.locationDetails ? ` - ${this.approvalRequest.locationDetails}` : ''}`;
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

  /**
   * @description Get the travel dates for the approval request
   * @returns {String}
   */
  getTravelDates(){
    if ( !this.approvalRequest.travelRequired ) return '';
    const startDate = typeTransform.toDateFromISO(this.approvalRequest.travelStartDate);
    const endDate = typeTransform.toDateFromISO(this.approvalRequest.travelEndDate);

    if ( !startDate ) return '';

    if ( !endDate || startDate.getTime() === endDate.getTime() ) {
      return typeTransform.toUtcString(startDate);
    }

    return `${typeTransform.toUtcString(startDate)} - ${typeTransform.toUtcString(endDate)}`;
  }

}

customElements.define('approval-request-details', ApprovalRequestDetails);
