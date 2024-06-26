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
      approvalRequest: {type: Object},
      approvalStatus: {type: String},
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);    
    this.approvalStatus = "";
    this._injectModel('AuthModel');

  }

  firstUpdated(changedProperties) { 
    this.checkApproverStatus(this.approvalRequest.approvalStatusActivity);
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
      let obj = {"prev": prev, "index":apActivity[index], "next":next}
      return obj;
    }

  /**
   * @description change the approval status for an approver
   * @param {Array} ap -  approval request activity array
   * @returns
  */
  async changeApprovalStatus(apActivity, thisApproverInfo){
    let approverOrder = thisApproverInfo.approverOrder;
    let givenStatus = this.PrevAndNext(apActivity, approverOrder);

    if(givenStatus.index.action == "approval-needed") {
      let givenprev = givenStatus.prev;
      if(givenprev.action == "approved") {
        this.approvalStatus = "Awaiting Your Approval"
      } else {
        let i = approverOrder;

        while (i >= 0){
          let newInd = this.PrevAndNext(apActivity, i);

          if((newInd.index.action == "approval-needed" && newInd.prev && newInd.prev.action == "approved")  ||  
          (newInd.index.action == "approval-needed" && newInd.prev === undefined)) {
            this.approvalStatus = `Awaiting Approval By ${newInd.index.employee.firstName} ${newInd.index.employee.lastName}`
            return;
          }
          i--;
        }
          
      }
    } else if(givenStatus.index.action == "approved" && givenStatus.next) {
        this.approvalStatus = "Approved by You";
    } else {
      this.approvalStatus = givenStatus.index.action;
    }

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