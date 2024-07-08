import { LitElement } from 'lit';
import {render} from "./app-page-admin-email-settings.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";
import ValidationHandler from "../../utils/ValidationHandler.js";


import "../../components/app-questions-or-comments.js";
import "../../components/email-template.js";

/**
 * @description Admin page for managing email settings
 * aka the default for the email sent out 
 */
export default class AppPageAdminEmailSettings extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

}

customElements.define('app-page-admin-email-settings', AppPageAdminEmailSettings);