import {LitElement } from 'lit';
import {render} from "./app-approver-type.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import "./ucdlib-employee-search-basic.js"
import ValidationHandler from "../utils/ValidationHandler.js";
import IamEmployeeObjectAccessor from '../../../lib/utils/iamEmployeeObjectAccessor.js';
import urlUtils from "../../../lib/utils/urlUtils.js";

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
      new: {type:Boolean, attribute: 'new'},
      parentPageId: {type: String, attribute: 'parent-page-id'},
    }
  }


  constructor() {
    super();
    this.existingApprovers = [];
    this.newApproverType = {};
    this.settingsCategory = 'admin-approver-form';
    this.query = {status:"active"};


    this.new = false;
    this.parentPageId = '';

    this.render = render.bind(this);
    this._injectModel('AppStateModel', 'AdminApproverTypeModel', 'SettingsModel');
    this._resetProperties();

  }

  /**
   * @description Get all data required for rendering this page
   * @return {Promise}
   */
  async init(){
    const promises = [
      this.SettingsModel.getByCategory(this.settingsCategory),
      this.AdminApproverTypeModel.query(this.query)
    ];
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
    this._resetNewApproverType();
    this.existingApprovers = [];
    this.new = false;

  }

  /**
   * @description reset new approver type object
   */
  _resetNewApproverType(){
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
      this.requestUpdate();
    }
  }

 /**
   * @description Adds a employee search bar to the employees section
   *
  */
  _onAddBar(approverType){
    if(!approverType.employees) approverType.employees = [];
    approverType.employees.push({});

    this.requestUpdate();
  }

  /**
   * @description Deletes a employee search bar from the employees section
   *
  */
  _onDeleteBar(employeeIndex, approverType) {
    if (!employeeIndex && approverType.employees.length == 1) {
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
  * @description Returns a approver type from the element's approverType array by approverTypeId
  * @param {Number}
  */
   getApproverTypeById(id){
    return this.existingApprovers.find(item => item.approverTypeId == id);
  }


  /**
   * @description bound to AdminApproverTypeModel APPROVER_TYPE_QUERY_REQUEST event
   * @param {CustomEvent} e
  */
  async _onApproverTypeQueryRequest(e){
    let query = e.query;
    if ( e.state === 'loaded' && urlUtils.queryStringFromObject(query) == urlUtils.queryStringFromObject(this.query)) {
      let approverArray = e.payload.filter(function (el) {
        return el.archived == false &&
              el.hideFromFundAssignment == false;
      });

      this.existingApprovers = approverArray.map(emp => this._copyApproverType(emp));

      this.requestUpdate();
    }
  }

  /**
   * @description Copy an approver type object and reset its state properties
   * @param {Object} approverType - approver type object from the AdminApproverTypeModel
   * @returns {Object}
   */
  _copyApproverType(approverType){
    approverType = JSON.parse(JSON.stringify(approverType));
    if ( !Array.isArray(approverType.employees) ) approverType.employees = [approverType.employees];
    approverType.editing = false;
    approverType.validationHandler = new ValidationHandler();
    return approverType;
  }


  /**
   * @description bound to AdminApproverTypeModel APPROVER_TYPE_UPDATED event
   * Fires after an approver type is updated - successfully or not
   * @param {CustomEvent} e
   */
   async _onApproverTypeUpdated(e){
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        const getApproverTypeId = e.data.approverTypeId;
        const approverType = this.getApproverTypeById(getApproverTypeId);
        approverType.validationHandler = new ValidationHandler(e);
        this.AppStateModel.showLoaded(this.parentPageId)
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when updating the approver type. Form data needs fixing.', type: 'error'})

      } else {
        this.AppStateModel.showToast({message: 'An unknown error ocurred when updating the approver type', type: 'error'})
        this.AppStateModel.showLoaded(this.parentPageId)
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
   * Fires after an approver type is created - successfully or not
   * @param {CustomEvent} e
   */
  async _onApproverTypeCreated(e){
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        this.newApproverType.validationHandler = new ValidationHandler(e);
        this.AppStateModel.showLoaded(this.parentPageId)
        this.requestUpdate();
        this.AppStateModel.showToast({message: 'Error when creating the approver type. Form data needs fixing.', type: 'error'})
      } else {
        this.AppStateModel.showToast({message: 'An unknown error ocurred when creating the approver type', type: 'error'})
        this.AppStateModel.showLoaded(this.parentPageId)
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
      let approverType =  this.getApproverTypeById(approverTypeId);
      await this.AdminApproverTypeModel.update(approverType);
    } else {
      await this.AdminApproverTypeModel.create(this.newApproverType);
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
   * @description on edit Cancel button from a approver
   *
   */
  async _onEditCancel(approver){

    if (!approver.approverTypeId) {
      this.new = false;
      this._resetNewApproverType();
      return;
    }

    let query = urlUtils.queryStringFromObject(this.query);

    let storeApproverType = this.AdminApproverTypeModel.store.data.query[query].payload.find(at => at.approverTypeId === approver.approverTypeId);

    // get index of approver in existing approvers and update approver
    let index = this.existingApprovers.findIndex(at => at.approverTypeId === approver.approverTypeId);
    this.existingApprovers[index] = this._copyApproverType(storeApproverType);

    this.requestUpdate();
  }

  /**
   * @description on archive button from a approver
   * @param {Object} approver
   */
  async _onDelete(approver){
    this.AppStateModel.showDialogModal({
      title : 'Delete Approver Type',
      content : 'Are you sure you want to delete this approver type?',
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

    await this.AdminApproverTypeModel.update(approverItem);

  }

}

customElements.define('app-approver-type', AppApproverType);
