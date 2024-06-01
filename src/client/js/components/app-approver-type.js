import { html, LitElement } from 'lit';
import {render, styles} from "./app-approver-type.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import "./ucdlib-employee-search-basic.js"
import ValidationHandler from "../utils/ValidationHandler.js";
import IamEmployeeObjectAccessor from '../../../lib/utils/iamEmployeeObjectAccessor.js';
import urlUtils from "../../../lib/utils/urlUtils.js";


export default class AppApproverType extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      existingApprovers:{type: Array, attribute: 'existingApprovers'},
      newApproverType:{type: Object, attribute: 'newApproverType'},
      approver: {type: Object, attribute: 'approver'},

    }
  }


  constructor() {
    super();
    this.id = 'admin-approvers';
    this.existingApprovers = [];
    this.newApproverType = {};


    this.new = false
    
    //may delete
    this.employeeIndex = [];
    this.newEmployees = [];
    this.index = 0;




    this.render = render.bind(this);
    this._injectModel('AppStateModel', 'AdminApproverTypeModel', 'SettingsModel');
    this._resetProperties();

  }

  _onNewApproverType(e){
    if (e.state === 'error' && e.error?.payload?.is400 ) {
      this.newApproverType.validationHandler = new ValidationHandler()
    }
  }

  _newForm(e) {
    this.new = true;
    this.requestUpdate();
  }

    /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( state.page != this.id ) return;
    this.AppStateModel.showLoading();

    const d = await this.getPageData();
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if ( hasError ) {
      this.AppStateModel.showError(d);
      return;
    }

    let category = await this.SettingsModel.getByCategory('admin-approver-form');
    this.description = category.payload[0].defaultValue;


    this.AppStateModel.showLoaded(this.id);

    this.requestUpdate();
  }


      /**
   * @description Get all data required for rendering this page
   */
       async getPageData(){
        let args = {status:"active"}; //if want all active do this to see your new ones

        const promises = [];
        promises.push(this.SettingsModel.getByCategory(this.settingsCategory));
        promises.push(this.AdminApproverTypeModel.query(args));
        const resolvedPromises = await Promise.allSettled(promises);
        return resolvedPromises;
      }
  

 /**
   * @description runs the refresh properties after edit/create/delete function runs
   * 
  */
    async _refreshProperties(){
      this._resetProperties();
      this.AppStateModel.refresh();
    }

  /**
   * @description reset properties for the approver
   * 
  */
  async _resetProperties(){
    this.newApproverType = {
      approverTypeId: 0,
      label: "",
      description: "",
      systemGenerated:false,
      hideFromFundAssignment:false,
      archived: false,
      employees: [],
      validationHandler : new ValidationHandler()
    }; 
    this.existingApprovers = [];
    this.new = false


    //may delete
    this.employeeIndex = [];
    this.newEmployees = [];
    this.index = 0;

  }

    /**
   * @description Event handler for when employees are selected from the employee search component
   * @param {CustomEvent} e - status-change event from ucdlib-employee-search-basic
   */
    _onEmployeeSelect(e, index) {
      let emp = e.detail.employee;
      if(emp){
        emp = (new IamEmployeeObjectAccessor(emp)).travelAppObject;
        emp.validationHandler = new ValidationHandler();
        if( this.employeeIsSelected(emp) ) return; //not yet wait for submit
        let empForm = { "employee" : emp, "approvalOrder": index}
        this.newEmployees.push(empForm);
      }
      //Plan for if it is taken out of employee form
      // this.newEmployees = [...this.newEmployees, ...newEmployees];
    }


  /**
   * @description Check if an employee is already in the selected list
   * @param {Object} employee - employee object
   * @returns
   */
   employeeIsSelected(employee) {
    if(this.newEmployees == null) return;
    return this.newEmployees.find(e => e.employee.kerberos === employee.kerberos);
  }

  _onAddBar(e, approver){
    if(!approver.employees) approver.employees = [];
    approver.employees.push({});
    this.index = this.index + 1;

    this.requestUpdate();
  }
  _onDeleteBar(e, index, approver){

    if(this.index != 0) this.index = this.index - 1;


    let filterEmployee = approver.employees.filter((item, ind) => ind !== index);
    let empForm = [];
    filterEmployee.map((emp, ind) => {
      empForm.push({ "employee" : emp, "approvalOrder": ind});
      
    });

    this.newEmployees = empForm;
    approver.employees = filterEmployee;
    this.requestUpdate();

  }

  async _setLabel(value, approver){
    approver.label = value;
    this.requestUpdate();
  }

  async _setDescription(value, approver){
    approver.description = value;
    this.requestUpdate();
  }

  isEqual(obj1, obj2) {
    var props1 = Object.getOwnPropertyNames(obj1);
    var props2 = Object.getOwnPropertyNames(obj2);
    if (props1.length != props2.length) {
        return false;
    }
    for (var i = 0; i < props1.length; i++) {
        let val1 = obj1[props1[i]];
        let val2 = obj2[props1[i]];
        let isObjects = this.isObject(val1) && this.isObject(val2);
        if (isObjects && !this.isEqual(val1, val2) || !isObjects && val1 !== val2) {
            return false;
        }
    }
    return true;
  }
  isObject(object) {
    return object != null && typeof object === 'object';
  }

  /**
   * @description Returns a approver type from the element's approverType array by approverTypeId
   */
   getApproverTypeId(id){
    return this.existingApprovers.find(item => item.approverTypeId == id);
  }


  /**
   * @description bound to AdminApproverTypeModel APPROVER_TYPE_QUERY_REQUEST event
   */

  async _onApproverTypeQueryRequest(e){
    let query = e.query;
 
    if ( e.state === 'loaded' && urlUtils.queryStringFromObject(query) == urlUtils.queryStringFromObject({'status':'active'})) {
      let approverArray = e.payload.filter(function (el) {
        return el.archived == false &&
              el.hideFromFundAssignment == false;
      });

      approverArray.map((emp) => {
        emp = {...emp};
        if(!Array.isArray(emp.employees)) emp.employees = [emp.employees];
        emp.editing = false;
        emp.validationHandler = new ValidationHandler();
        return emp;
      });
  
      this.existingApprovers = approverArray;
  
      this.requestUpdate();
    }

  }


  /**
   * @description bound to AdminApproverTypeModel APPROVER_TYPE_UPDATED event
   */
   async _onApproverTypeUpdated(e){
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        const getApproverTypeId = e?.payload?.getApproverTypeId;
        const approverType = this.getApproverTypeId(getApproverTypeId);
        approverType.validationHandler = new ValidationHandler(e);
        this.AppStateModel.showLoaded(this.id)
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when updating the approver type. Form data needs fixing.', type: 'error'})

      } else {
        this.AppStateModel.showToast({message: 'An unknown error ocurred when updating the approver type', type: 'error'})
        this.AppStateModel.showLoaded(this.id)
      }
      window.scrollTo(0, this.lastScrollPosition);
    } else if ( e.state === 'loading' ) {
      this.AppStateModel.showLoading();

    } else if ( e.state === 'loaded' ) {
      this._refreshProperties();
      let archived = e.payload.data.res[0].archived;
      if ( archived ) {
        this.AppStateModel.showToast({message: 'Approver Type deleted successfully', type: 'success'});
      } else {
        this.AppStateModel.showToast({message: 'Approver Type updated successfully', type: 'success'});
      }
    }
  }

  /**
   * @description bound to AdminApproverTypeModel APPROVER_TYPE_CREATED event
   */
  async _onApproverTypeCreated(e){
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        this.newApproverType.validationHandler = new ValidationHandler(e);
        this.AppStateModel.showLoaded(this.id)
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when creating the approver type. Form data needs fixing.', type: 'error'})
      } else {
        this.AppStateModel.showToast({message: 'An unknown error ocurred when creating the approver type', type: 'error'})
        this.AppStateModel.showLoaded(this.id)
      }
      window.scrollTo(0, this.lastScrollPosition);
    } else if ( e.state === 'loading' ) {
      this.AppStateModel.showLoading();
    } else if ( e.state === 'loaded' ) {
      this._refreshProperties();
      this.AppStateModel.showToast({message: 'Approver Type created successfully', type: 'success'});
    }
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
    async _onFormSubmit(e){
      e.preventDefault();
      this.lastScrollPosition = window.scrollY;

      const approverTypeId = e.target.getAttribute('approver-type-id');
      if ( approverTypeId != 0 && approverTypeId) {
        let approverType =  this.existingApprovers.find(a => a.approverTypeId == approverTypeId);
        approverType.employees = [];
        approverType.employees = this.newEmployees;
        delete approverType.editing;
        console.log(`Done Updating Approver Type No. ${approverTypeId} ...`);

        await this.AdminApproverTypeModel.update(approverType);
      } else {
        this.newApproverType.employees = [];
        this.newApproverType.employees = this.newEmployees;
        await this.AdminApproverTypeModel.create(this.newApproverType);
        console.log("Done Creating...");

      }

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

    if(approver.employees == null) { 
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

  /**
   * @description on edit Cancel button from a approver
   * 
   */
    async _onEditCancel(e, approver){
      

      if (!approver.approverTypeId) {
        this.new = false;
        this.newApproverType = {};
        return;
      }
      this.new = false;
      approver.editing = false;
      approver.validationHandler = new ValidationHandler();

      for(let i = this.index; i > 0;  i--){
        approver.employees.pop()
      }
      this.index = 0;

    
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