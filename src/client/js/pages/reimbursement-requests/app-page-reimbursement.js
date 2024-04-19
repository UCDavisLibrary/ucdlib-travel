import { LitElement } from 'lit';
import {render} from "./app-page-reimbursement.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class AppPageReimbursement extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {

    }
  }


  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel');
  }

}

customElements.define('app-page-reimbursement', AppPageReimbursement);
