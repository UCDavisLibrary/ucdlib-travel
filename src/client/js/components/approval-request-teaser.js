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
  
    this._injectModel('AuthModel');

  }

  formatDollar(dollar){
    let dollarFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    dollar = dollarFormat.format(dollar)
    return dollar
  }

  formatDate(date){
    const event = new Date(date);
    date = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
      }).format(event)

    return date;
  }

  checkKerb(kerb){
    if(this.AuthModel.getToken().token.preferred_username == kerb) return true;
    return false;
  }

  ToUpperCase(str, separators=['-']) {
    separators = separators || [ ' ' ];
    let regex = new RegExp('(^|[' + separators.join('') + '])(\\w)', 'g');
    return str.toLowerCase().replace(regex, function(x) { return x.toUpperCase(); });
  }

}

customElements.define('approval-request-teaser', ApprovalRequestTeaser);