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
   
    this._resetProperties();

  }

  connectedCallback() {
    this._getApproverType();
    super.connectedCallback()
  }

 /**
   * @description runs the refresh properties after edit/create/delete function runs
   * 
  */
    async _refreshProperties(){
      this._getApproverType();
      this._resetProperties();
      this.requestUpdate();
    }

  /**
   * @description reset properties for the approver
   * 
  */
  async _resetProperties(){
    this.label = "";
    this.description = "";
    this.employees = [];
    this.newApprover = {
      approverTypeId: 0,
      label: {},
      description: {},
      systemGenerated:false,
      hideFromFundAssignment:false,
      archived: false,
      employees: []
    }; 
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

      this.newApprover = this.employeeFormat(this.newApprover);

      document.querySelector(".inputLabel").value = "";
      document.querySelector(".textDescription").value = "";

      await this.AdminApproverTypeModel.create(this.newApprover);

      this._refreshProperties();

      

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
   * @description on edit button from a approver
   * @returns {Array} array of objects with updated employees
   * 
   */
   employeeFormat(approver){
    if(approver.employees[0] == null) approver.employees = [];

        // approver.employees = [{
        //                 employee: {
        //                   "kerberos": "EditGuiEmp",
        //                   "firstName": "emp1",
        //                   "lastName": "emp2",
        //                   "department": null
        //                   },
        //                 approvalOrder: 5 
        //               }];
        // approver.employees = this.employees;
    return approver;
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

        editApprover = this.employeeFormat(editApprover);
        
        await this.AdminApproverTypeModel.update(editApprover);

        this._refreshProperties();
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

  /**
   * @description on dialog action for deleting an approver
   * 
  */
  async _onDialogAction(e){
    if ( e.action !== 'delete-approver-item' ) return;
    let approverItem = e.data.approver;
    approverItem.archived = true;

    approverItem = this.employeeFormat(approverItem);

    await this.AdminApproverTypeModel.update(approverItem);

    this._refreshProperties();

  }

  /**
   * @description Get Approver type from query
   * 
  */
  async _getApproverType(){
    let args = { id: [2, 5, 10,151, 174, 175, 176, 248, 249, 252, 255, 256]};
    let approvers = await this.AdminApproverTypeModel.query(args);
    let approverArray = approvers.payload.filter(function (el) {
      return el.archived == false &&
             el.hideFromFundAssignment == false;
    });

  approverArray.map((emp) => {
    if(!Array.isArray(emp.employees)) emp.employees = [emp.employees]
  });

  this.existingApprovers = approverArray;

  this.requestUpdate();
  }

}

customElements.define('app-approver-type', AppApproverType);