import { LitElement } from 'lit';
import {render} from "./approval-request-teaser.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import applicationOptions from '../../../lib/utils/applicationOptions.js';
import typeTransform from '../../../lib/utils/typeTransform.js';

/**
 * @class ApprovalRequestTeaser
 * @description Component that displays a preview of an approval request and links to the full request page
 * @property {Object} approvalRequest - The approval request object
 * @property {String} approvalStatus - The approval status of the request. Computed from approvalRequest object.
 * @property {String} reimbursementStatus - The reimbursement status of the request. Computed from approvalRequest object.
 * @property {String} programDates - The program dates of the request. Computed from approvalRequest object.
 * @property {String} currentUser - The current user's kerberos id
*/
export default class ApprovalRequestTeaser extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {
  static get properties() {
    return {
      approvalRequest: {type: Object},
      approvalStatus: {state: true},
      reimbursementStatus: {state: true},
      programDates: {state: true},
      currentUser: {state: true}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);
    this.approvalRequest = {};
    this.approvalStatus = "";
    this.reimbursementStatus = "";
    this.programDates = "";

    this._injectModel('AuthModel');
    this.currentUser = this.AuthModel.getToken().token.preferred_username;

  }

  /**
   * @description lit lifecycle method
   * @param {Map} props - changed properties
   */
  willUpdate(props) {
    if ( props.has('approvalRequest') ) {
      this._setApprovalStatus();
      this._setReimbursementStatus();
      this._setProgramDates();
    }

  }

  /**
   * @description formatting the currency to dollar format
   * @param {Float32Array} dollar -  funding amount
   * @returns
  */
  formatDollar(dollar) {
    let dollarFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    dollar = dollarFormat.format(dollar);
    return dollar;
  }

  /**
   * @description Set this.approvalStatus based on the current approval request object
   * @returns
   */
  _setApprovalStatus(){
    const activity = this.approvalRequest?.approvalStatusActivity || [];

    if ( !['submitted', 'in-progress'].includes(this.approvalRequest.approvalStatus) ) {
      this.approvalStatus = applicationOptions.approvalStatusLabel(this.approvalRequest.approvalStatus)
      return;
    }
    if ( applicationOptions.isNextApprover(this.approvalRequest, this.currentUser) ) {
      this.approvalStatus = "Awaiting Your Approval";
      return;
    }
    const currentUserApproved = activity.find(a => a.employeeKerberos === this.currentUser && a.action === 'approved');
    if ( currentUserApproved ) {
      this.approvalStatus = "Approved by You";
      return;
    }
    const currentUserNeedsApproval = activity.find(a => a.employeeKerberos === this.currentUser && a.action === 'approval-needed');
    const nextApprover = activity.find(a => a.action === 'approval-needed');
    if ( (currentUserApproved || currentUserNeedsApproval) && nextApprover ) {
      this.approvalStatus = `Awaiting Approval From ${nextApprover?.employee?.firstName} ${nextApprover?.employee?.lastName}`;
      return;
    }
    this.approvalStatus = applicationOptions.approvalStatusLabel(this.approvalRequest.approvalStatus)
  }

  /**
   * @description Set this.reimbursementStatus based on the current approval request object
   * @returns
   */
  _setReimbursementStatus(){
    if (this.approvalRequest.reimbursementStatus === 'not-required') {
      this.reimbursementStatus = '';
      return;
    }
    if ( this.approvalRequest.approvalStatus !== 'approved') {
      this.reimbursementStatus = '';
      return;
    }
    this.reimbursementStatus = applicationOptions.reimbursementStatusLabel(this.approvalRequest.reimbursementStatus);
  }

  /**
   * @description Set this.programDates based on the current approval request object
   */
  _setProgramDates(){
    this.programDates = typeTransform.dateRangeFromIsoString(this.approvalRequest.programStartDate, this.approvalRequest.programEndDate);
  }

}

customElements.define('approval-request-teaser', ApprovalRequestTeaser);
