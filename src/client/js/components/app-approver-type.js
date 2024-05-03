import { LitElement } from 'lit';
import {render, styles} from "./app-approver-type.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import "./ucdlib-employee-search-basic.js"


export default class AppApproverType extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      existingApprovers:{type: Array, attribute: 'existingApprovers'},
    }
  }

  // static get styles() {
  //   return styles();
  // }

  constructor() {
    super();
    this.systemGenerated = true;
    this.existingApprovers = [];
    this.render = render.bind(this);
    this._injectModel('AppStateModel', 'AdminApproverTypeModel');
   

  }

  connectedCallback() {
    this._getApproverType();

    super.connectedCallback()
  }

    /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
    //  async _onAppStateUpdate(state) {
    //    console.log(state);
    //   this._getApproverType();
    // }
  

  async _getApproverType(){
    let args = [{id:[1, 2, 3, 4, 10], status:"active"}];
    let approvers = await this.AdminApproverTypeModel.query(args);
    let approverArray = approvers.payload.filter(function (el) {
      return el.archived == false &&
             el.hideFromFundAssignment == false;
    });

    this.existingApprovers = approverArray;
    this.requestUpdate();
  }

}

customElements.define('app-approver-type', AppApproverType);