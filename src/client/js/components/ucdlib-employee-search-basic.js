import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-employee-search-basic.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";

export default class UcdlibEmployeeSearchBasic extends Mixin(LitElement)
.with(LitCorkUtils) {

  static get properties() {
    return {

    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('EmployeeModel');
  }

}

customElements.define('ucdlib-employee-search-basic', UcdlibEmployeeSearchBasic);
