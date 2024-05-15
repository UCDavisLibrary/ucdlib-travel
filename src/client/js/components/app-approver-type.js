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

  async _setLabel(value){
    this.label = value;
  }

  async _setDescription(value){
    this.description = value;
  }

  /**
   * @description on submit button get the form data
   * 
   */
    async _onSubmit(){
      console.log(this.label);
      console.log(this.description);

      document.querySelector(".inputLabel").value = "";
      document.querySelector(".textDescription").value = "";;

      this.requestUpdate();

    }

  /**
   * @description Get Approver type from query
   * 
  */
  async _getApproverType(){
    // let args = [{ status:"active"}];
    // let approvers = await this.AdminApproverTypeModel.query(args);
    // let approverArray = approvers.payload.filter(function (el) {
    //   return el.archived == false &&
    //          el.hideFromFundAssignment == false;
    // });

    let approverArray = 
    [
      {
        "approverTypeID": 175,
        "label": "updateNew44",
        "description": "updateNew44",
        "systemGenerated": false,
        "hide_from_fund_assignment": false,
        "archived": false,
        "approvalOrder": 72,
        "employees": [{
          "kerberos": "updateNew44Emp",
          "firstName": "anotherR",
          "lastName": "anotherS",
          "approvalOrder": 72
        }, 
        {
          "kerberos": "updateNew44Emp22",
          "firstName": "anotherS",
          "lastName": "anotherT",
          "approvalOrder": 72
        }]
      },

      {
        "approverTypeID": 1,
        "label": "Supervisor",
        "description": "The current direct supervisor of the requester from iam.staff.library.ucdavis.edu.",
        "systemGenerated": true,
        "hide_from_fund_assignment": false,
        "archived": false,
        "approvalOrder": null,
        "employees": [{
          "kerberos": null,
          "firstName": null,
          "lastName": null,
          "approvalOrder": null
        }]
      },
      {
        "approverTypeID": 3,
        "label": "Finance Head",
        "description": "The head of the Library Finance department",
        "systemGenerated": true,
        "hide_from_fund_assignment": false,
        "archived": false,
        "approvalOrder": null,
        "employees": [{
          "kerberos": null,
          "firstName": null,
          "lastName": null,
          "approvalOrder": null
        }]
      }
    ];

    this.existingApprovers = approverArray;
    this.requestUpdate();
  }

}

customElements.define('app-approver-type', AppApproverType);