import {LitElement } from 'lit';
import {render} from "./app-approver-type.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import "./ucdlib-employee-search-basic.js"
import ValidationHandler from "../utils/ValidationHandler.js";
import IamEmployeeObjectAccessor from '../../../lib/utils/iamEmployeeObjectAccessor.js';
import urlUtils from "../../../lib/utils/urlUtils.js";
import AppPageAdminApprovers from '../pages/admin/app-page-admin-approvers.js';

/**
 * @description Admin approvertype component for managing approver type options
 * where user can create, edit, and archive an approver type for approver requests
 * @param {Array} existingApprovers - local copy of active approvertype objects from AdminApproverTypeModel
 * @param {Object} newApproverType - new approver type object being created
 * @param {Boolean} new - Tells if it is new approver to activate form or not

 */
export default class AppApproverType extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      existingApprovers:{type: Array, attribute: 'existingApprovers'},
      newApproverType:{type: Object, attribute: 'newApproverType'},
      new: {type:Boolean, attribute: 'new'}
    }
  }


  constructor() {
    super();
    this.existingApprovers = [];
    this.newApproverType = {};


    this.new = false;
    this.element = 'admin-approvers';
    
    this.render = render.bind(this);
    this._injectModel('AppStateModel', 'AdminApproverTypeModel', 'SettingsModel');
    this._resetProperties();

  }

  /**
   * @description Change new property from to true
   * @param {CustomEvent} e 
   */
  _newForm(e) {
    this.new = true;
  }

    /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( state.page != this.element ) return;
    this.AppStateModel.showLoading();

    const d = await this.getPageData();
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if ( hasError ) {
      this.AppStateModel.showError(d);
      return;
    }

    this.AppStateModel.showLoaded(this.element);

    this.requestUpdate();
  }


  /**
   * @description Get all data required for rendering this page
   * @return {Promise}
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
   * @description reset properties
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
    this.new = false;

  }

    /**
   * @description Event handler for when employees are selected from the employee search component
   * @param {CustomEvent} e - status-change event from ucdlib-employee-search-basic
   */
    _onEmployeeSelect(e, approverType, employeeIndex) {
      let emp = e.detail.employee;
      if(emp){
        emp = (new IamEmployeeObjectAccessor(emp)).travelAppObject;
        approverType.employees[employeeIndex] = emp
      }
    }

 /**
   * @description Adds a employee bar to the employees section
   * 
  */
  _onAddBar(e, approverType){
    if(!approverType.employees) approverType.employees = [];
    approverType.employees.push({});

    this.requestUpdate();
  }

  /**
   * @description Deletes a employee bar from the employees section
   * 
  */
  _onDeleteBar(e, employeeIndex, approverType) {
    if (!employeeIndex) {
      approverType.employees[0] = {};
    } else {
      approverType.employees.splice(employeeIndex, 1);
    }
    this.requestUpdate()
  }

  /**
   * @description Set the label for the approver object
   * 
  */
  async _setLabel(value, approver){
    approver.label = value;
    this.requestUpdate();
  }

 /**
   * @description Set the description for the approver object
   * 
  */
  async _setDescription(value, approver){
    approver.description = value;
    this.requestUpdate();
  }


 /**
   * @description checks if something is an object
   * @param {Object} object
   * @returns {Boolean} whether it is true or false
  */
  isObject(object) {
    return object != null && typeof object === 'object';
  }

  /**
  * @description Returns a approver type from the element's approverType array by approverTypeId
  * @param {Number} 
  */
   getApproverTypeId(id){
    return this.existingApprovers.find(item => item.approverTypeId == id);
  }


  /**
   * @description bound to AdminApproverTypeModel APPROVER_TYPE_QUERY_REQUEST event
   * @param {CustomEvent} e
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
   * @param {CustomEvent} e
   */
   async _onApproverTypeUpdated(e){
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        const getApproverTypeId = e.data.approverTypeId;
        const approverType = this.getApproverTypeId(getApproverTypeId);
        approverType.validationHandler = new ValidationHandler(e);
        this.AppStateModel.showLoaded(this.element)
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when updating the approver type. Form data needs fixing.', type: 'error'})

      } else {
        this.AppStateModel.showToast({message: 'An unknown error ocurred when updating the approver type', type: 'error'})
        this.AppStateModel.showLoaded(this.element)
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
   * @param {CustomEvent} e
   */
  async _onApproverTypeCreated(e){
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        this.newApproverType.validationHandler = new ValidationHandler(e);
        this.AppStateModel.showLoaded(this.element)
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when creating the approver type. Form data needs fixing.', type: 'error'})
      } else {
        this.AppStateModel.showToast({message: 'An unknown error ocurred when creating the approver type', type: 'error'})
        this.AppStateModel.showLoaded(this.element)
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
   * @param {CustomEvent} e
   * 
   */
    async _onFormSubmit(e){
      e.preventDefault();
      this.lastScrollPosition = window.scrollY;

      const approverTypeId = e.target.getAttribute('approver-type-id');
      if ( approverTypeId != 0 && approverTypeId) {
        let approverType =  this.existingApprovers.find(a => a.approverTypeId == approverTypeId);
        console.log(`Updating Approver Type No. ${approverTypeId} ...`);
        await this.AdminApproverTypeModel.update(this.employeeFormat(approverType));
      } else {
        await this.AdminApproverTypeModel.create(this.employeeFormat(this.newApproverType));
        console.log("Creating...");

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
   * @param {Object} approver
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

      let query = "status=active";

      let storeApproverType = this.AdminApproverTypeModel.store.data.query[query].payload.find(at => at.approverTypeId === approver.approverTypeId);

      for( let prop in storeApproverType ) {
        approver[prop] = storeApproverType[prop];
      }

      approver.validationHandler = new ValidationHandler();
    
      this.requestUpdate();
    }

  /**
   * @description on archive button from a approver
   * @param {Object} approver 
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
   * @param {CustomEvent} 
  */
  async _onDialogAction(e){
    if ( e.action !== 'delete-approver-item' ) return;
    let approverItem = e.data.approver;
    approverItem.archived = true;
    approverItem = this.employeeFormat(approverItem);

    await this.AdminApproverTypeModel.update(approverItem);

    this._refreshProperties();

  }

}

customElements.define('app-approver-type', AppApproverType);