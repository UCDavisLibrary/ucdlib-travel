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
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    let mon = month[event.getMonth()];

    date = `${mon} ${event.getDay()}, ${event.getFullYear()}`;

    return date;
  }

  checkKerb(kerb){
    
    return true;
  }

}

customElements.define('approval-request-teaser', ApprovalRequestTeaser);