import { LitElement } from 'lit';
import {render} from "./approval-request-teaser.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import applicationOptions from '../../../lib/utils/applicationOptions.js';

/**
 * @class ApprovalRequestTeaser
 * @description Component that displays active requests
 * @property {Object} approvalRequest - The approval request object
*/
export default class ApprovalRequestTeaser extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {
  static get properties() {
    return {
      approvalRequest: {type: Object},
      approvalStatus: {type: String},
      reimbursementStatus: {type: String},
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);    
    this.approvalStatus = "";
    this.reimbursementStatus = "";
    this._injectModel('AuthModel');

  }

  firstUpdated(changedProperties) { 
    this.checkApproverStatus(this.approvalRequest.approvalStatusActivity);
    this.reimbursementStatus = applicationOptions.reimbursementStatusLabel(this.approvalRequest.reimbursementStatus)

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
   * @description formatting the date given
   * @param {String} date -  date string given
   * @returns
  */
  formatDate(date){
    const event = new Date(date);
    date = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
      }).format(event)

    return date;
  }

  /**
   * @description check the kerberos is not the current one on the page
   * @param {String} kerb -  approval request kerberos id
   * @returns
  */
  checkKerb(kerb){
    if( this.AuthModel.getToken().token.preferred_username == kerb) {
        return true;
    };
    return false;
  }

  /**
   * @description check the status of the request if approvers
   * @param {Array} ap -  approval request activity array
  */
  checkApproverStatus(kerbActivity){
    const found = kerbActivity.find(a => this.checkKerb(a.employeeKerberos));
    if(found !== undefined) {
      this.changeApprovalStatus(this.approvalRequest.approvalStatusActivity, found);
      return;
    }
    this.approvalStatus = applicationOptions.approvalStatusLabel(this.approvalRequest.approvalStatus)
    return;
  }


  /**
   * @description change the approval status for an approver
   * @param {Array} ap -  approval request activity array
   * @returns
  */
  async changeApprovalStatus(apActivity, thisApproverInfo){
    let approverOrder = thisApproverInfo.approverOrder;
    let givenStatus = apActivity[approverOrder];
    let stat = (this.approvalRequest.approvalStatusActivity || []).find(a => a.action === 'approval-needed');

    if(this.approvalRequest.approvalStatus == 'submitted' || this.approvalRequest.approvalStatus == 'in-progress'){
      if(givenStatus.action == "approval-needed") {

        if(applicationOptions.isNextApprover(this.approvalRequest, givenStatus.employeeKerberos)){
          this.approvalStatus = "Awaiting Your Approval"
        } else {
          this.approvalStatus = `Awaiting Approval By ${stat.employee.firstName} ${stat.employee.lastName}`;
        }
      } else if(givenStatus.action == "approved" && stat) {
          this.approvalStatus = "Approved by You";
      } else {
        this.approvalStatus = applicationOptions.approvalStatusLabel(givenStatus.action);
      }
    }

  }

}

customElements.define('approval-request-teaser', ApprovalRequestTeaser);