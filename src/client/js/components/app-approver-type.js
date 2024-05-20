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
      newApproverType:{type: Object, attribute: 'newApproverType'},

    }
  }

  // static get styles() {
  //   return styles();
  // }

  constructor() {
    super();
    this.existingApprovers = [];
    this.newApproverType = {};
    this.render = render.bind(this);
    this._injectModel('AppStateModel', 'AdminApproverTypeModel');
   
    this._resetProperties();

  }


  /**
   * @description lit lifecycle method
   */
     willUpdate(changedProps) {
      if ( changedProps.has('newApproverType') ) {
        this.requestUpdate();
      }
    }

    /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( state.page != 'admin-approvers' ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.showLoaded('admin-approvers');
    this._getApproverType();

    this.requestUpdate();
  }
  

 /**
   * @description runs the refresh properties after edit/create/delete function runs
   * 
  */
    async _refreshProperties(){
      // this._getApproverType();
      this._resetProperties();
      this.AppStateModel.refresh();
    }

  /**
   * @description reset properties for the approver
   * 
  */
  async _resetProperties(){
    this.label = "";
    this.description = "";
    this.employees = [];
    this.newApproverType = {
      approverTypeId: 0,
      label: "",
      description: "",
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
  //   this.newApproverType = e.payload.map(at => {
  //     at = {...at};
  //     at.editing = false;
  //     // at.validationHandler = new ValidationHandler();
  //     return at;
  //   });
  // }

  async _setLabel(value, approver){
    approver.label = value;
  }

  async _setDescription(value, approver){
    approver.description = value;
  }

  /**
   * @description on submit button get the form data
   * 
   * let data = {
      "approverTypeId": 0,
      "label": "mkl",
      "description": "wfe",
      "systemGenerated": false,
      "hideFromFundAssignment": false,
      "archived": false,
      "employees":[
        {
          "employee":{kerberos: "MaybeF2", firstName:"F", lastName:"G", department:null},
          "approvalOrder": 5 
        },
        {
          "employee":{kerberos: "MaybeF22", firstName:"G", lastName:"H", department:null},
          "approvalOrder": 5 
        }
      ]
     };   

   * 
   * 
   */
    async _onNewSubmit(e){
      e.preventDefault();
      this.lastScrollPosition = window.scrollY;

      const approverTypeId = e.target.getAttribute('approver-type-id');
      if ( approverTypeId != 0 && approverTypeId) {
        let approverType =  this.existingApprovers.find(a => a.approverTypeId == approverTypeId);
        delete approverType.editing;
        approverType = this.employeeFormat(approverType);
        console.log(approverType);

        await this.AdminApproverTypeModel.update(approverType);
      } else {
        this.newApproverType = this.employeeFormat(this.newApproverType);
        await this.AdminApproverTypeModel.create(this.newApproverType);


        console.log("Done Creating...");

      }

      //this will be deleted
      // document.querySelector(".inputLabel").value = "";
      // document.querySelector(".textDescription").value = "";

      this._refreshProperties();
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
   * @description on edit button from a approver
   * @returns {Array} array of objects with updated employees
   * 
   */
   employeeFormat(approver){
    let employeeFormat = [];

    if(approver.employees[0] == null) { 
      approver.employees = [];
      return approver;
    }
    
    for (let [index, a] of approver.employees.entries()){
      let samp = {employee:a, approvalOrder: index}
      employeeFormat.push(samp);
    }
    approver.employees = employeeFormat;
    return approver;
}

  // /**
  //  * @description on edit Save button from a approver
  //  * 
  //  */
  //      async _onEditSave(e, editApprover){
  //       editApprover.editing = false;
  //       editApprover = this.employeeFormat(editApprover);
        
  //       await this.AdminApproverTypeModel.update(editApprover);
  //       this._refreshProperties();
  //   }

  /**
   * @description on edit Cancel button from a approver
   * 
   */
    async _onEditCancel(e, approver){
      if (!approver.approverTypeId) {
        newApproverType = {};
        return;
      }
    
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
    // let args = {status:"active"}; //if want all active do this to see your new ones
    let args = { id: [1,2,3,4,5,117,118]};

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