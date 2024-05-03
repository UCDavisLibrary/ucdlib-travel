import { LitElement } from 'lit';
import {render} from "./ucdlib-employee-search-advanced.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class UcdlibEmployeeSearchAdvanced extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      _initialized: {state: true},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this._initialized = false;

    this._injectModel('EmployeeModel');
  }

}

customElements.define('ucdlib-employee-search-advanced', UcdlibEmployeeSearchAdvanced);