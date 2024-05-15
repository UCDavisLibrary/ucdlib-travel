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
    this.newApprover = {
      approverTypeId: 0,
      label: {},
      description: {},
      systemGenerated:false,
      hideFromFundAssignment:false,
      archived: false,
      employees: []
    };    
    this.render = render.bind(this);
    this._injectModel('AppStateModel', 'AdminApproverTypeModel');
   

  }

  connectedCallback() {
    this._getApproverType();

    super.connectedCallback()
  }

    /**
   * @description bound to ApproverType BASIC_EMPLOYEES_FETCHED event
   * fires when active line items are fetched from the server
   */
  // _onBasicEmployeesFetched(e){
  //   if ( e.state !== 'loaded' ) return;
  //   this.newApprover = e.payload.map(at => {
  //     at = {...at};
  //     at.editing = false;
  //     // at.validationHandler = new ValidationHandler();
  //     return at;
  //   });
  // }

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
    async _onNewSubmit(){
      this.newApprover.label = this.label;
      this.newApprover.description = this.description;
      // this.newApprover.employees = this.employees;

      document.querySelector(".inputLabel").value = "";
      document.querySelector(".textDescription").value = "";

      // await this.AdminApproverTypeModel.create(this.newApprover);
      this._getApproverType();

      this.newApprover = {};
      this.requestUpdate();

      

    }

  /**
   * @description on edit button from a approver
   * 
   */
       async _onEdit(e, approver){
        approver.editing = true;
        this.requestUpdate();
  
    }


  /**
   * @description on edit Save button from a approver
   * 
   */
       async _onEditSave(e, approver){
        let editApprover = approver;
        editApprover.editing = false;
        editApprover.label = this.label;
        editApprover.description = this.description;
        // editApprover.employees = this.employees;
        console.log(editApprover);
        
        // await this.AdminApproverTypeModel.update(approver);
        this._getApproverType();
        this.requestUpdate();
  
    }

      /**
   * @description on edit Cancel button from a approver
   * 
   */
       async _onEditCancel(e, approver){
        approver.editing = false;

        this.requestUpdate();
  
    }

  /**
   * @description on archive button from a approver
   * 
   */
       async _onDelete(approver){
        approver.archived = true;

        this.AppStateModel.showDialogModal({
          title : 'Delete Approver Type Option',
          content : 'Are you sure you want to delete this Approver Type Option?',
          actions : [
            {text: 'Delete', value: 'delete-approver-item', color: 'double-decker'},
            {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
          ],
          data : {approver}
        });         
    }

    _onDialogAction(e){
      if ( e.action !== 'delete-approver-item' ) return;
      const approverItem = e.data.approver;
      approverItem.archived = true;
      // await this.AdminApproverTypeModel.update(approverItem);
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
          "employees": [
              {
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
              }
          ]
      },
      {
          "approverTypeID": 1,
          "label": "Supervisor",
          "description": "The current direct supervisor of the requester from iam.staff.library.ucdavis.edu.",
          "systemGenerated": true,
          "hide_from_fund_assignment": false,
          "archived": false,
          "approvalOrder": null,
          "employees": {
              "kerberos": null,
              "firstName": null,
              "lastName": null,
              "approvalOrder": null
          }
      },
      {
          "approverTypeID": 3,
          "label": "Finance Head",
          "description": "The head of the Library Finance department",
          "systemGenerated": true,
          "hide_from_fund_assignment": false,
          "archived": false,
          "approvalOrder": null,
          "employees": {
              "kerberos": null,
              "firstName": null,
              "lastName": null,
              "approvalOrder": null
          }
      }
  ];

  approverArray.map((emp) => {
    if(!Array.isArray(emp.employees)) emp.employees = [emp.employees]
  });

  this.existingApprovers = approverArray;

  this.requestUpdate();
  }

}

customElements.define('app-approver-type', AppApproverType);