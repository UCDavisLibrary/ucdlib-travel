import { LitElement } from 'lit';
import {render} from "./approval-request-teaser.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";

/**
 * @class ApprovalRequestTeaser
 * @description Component that displays active requests
 * @property {Object} approvalRequest - The approval request object
 */
export default class ApprovalRequestTeaser extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {
  static get properties() {
    return {
      approvalRequest: {type: Object}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);    
    this.isApprover = false;

    this._injectModel('AuthModel');

  }

  
  // firstUpdated(changedProperties) {
  //   // console.log(changedProperties);
  //   this.checkApproverStatus(this.approvalRequest.approvalStatusActivity);
  //   console.log( this.isApprover);
  // }

  /**
   * @description formatting the currency to dollar format
   * @param {Float32Array} dollar -  funding amount 
   * @returns
   */
  formatDollar(dollar){
    let dollarFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    dollar = dollarFormat.format(dollar)
    return dollar
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
      return found;
    }
    return false;
  }

    /**
   * @description gets the previous and next values based of index
   * @param {Array} ap -  approval request activity array
   */
    PrevAndNext(apActivity, order){
      const index = apActivity.findIndex((a) => a.approverOrder === order);
      const prev = apActivity[index - 1];
      const next = apActivity[index + 1];
      if (index === -1) {
        return undefined
      }
      
      return {"prev": prev, "index":apActivity[index], "next":next}
    }

  /**
   * @description change the approval status for an approver
   * @param {Array} ap -  approval request activity array
   * @returns
  */
  async changeApprovalStatus(apActivity){
    let approverKerbActivity = this.checkApproverStatus(apActivity);
    let approverOrder = approverKerbActivity.approverOrder;
    let status;

    let givenStatus = this.PrevAndNext(apActivity, approverOrder);

    console.log(givenStatus);

    if(givenStatus.index.action == "approval-needed") {
      let givenprev = givenStatus.prev;
      if(givenprev.action == "approved") {
        status = "Awaiting Your Approval"
      } else {
        //add loop for given prev not being undefined and previous is not approved
        let i = approverOrder;
        while (i >= 0){
          let newInd = this.PrevAndNext(givenprev, givenprev.approverOrder);
          if(newInd.index.action == "approval-needed") {
            return `Awaiting Approval By ${approverTypeLabel}`
          }
          i--;
        }
          
      }
    } else if(givenStatus.index.action == "approved" && givenStatus.next) {
        status = "Approved by You";
    } else {
      status = givenStatus.index.action;
    }
      

      // console.log("I:",givenStatus.index);
      // console.log("P:",givenStatus.prev);
      // console.log("N:",givenStatus.next);


    // return newStatus;
  }

  /**
   * @description change the Status bar text to upper case
   * @param {String} str -  string given
   * @param {Array} separators -  array of strings given for seperation
   * @returns
   */
  ToUpperCase(str, separators=['-']) {
    separators = separators || [ ' ' ];
    let regex = new RegExp('(^|[' + separators.join('') + '])(\\w)', 'g');
    return str.toLowerCase().replace(regex, function(x) { return x.toUpperCase(); });
  }

}

customElements.define('approval-request-teaser', ApprovalRequestTeaser);