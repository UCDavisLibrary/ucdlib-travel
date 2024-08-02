import { LitElement } from 'lit';
import {render} from "./app-page-admin-email-settings.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";
import ValidationHandler from "../../utils/ValidationHandler.js";


import "../../components/email-template.js";

/**
 * @description Admin page for managing email settings
 * aka the default for the email sent out 
 */
export default class AppPageAdminEmailSettings extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'admin-email-settings';

    this.settings = [];
    this.searchString = '';
    this.settingsHaveChanged = false;
    this.noSettings = false;
    this.variableList = [
      "requesterFirstName",
      "requesterLastName",
      "requesterFullName",
      "requesterKerberos",
      "requesterLabel",
      "requesterOrganization",
      "requesterBuisnessPurpose",
      "requesterLocation",
      "requesterProgramDate",
      "requesterTravelDate",
      "requesterComments",
      "nextApproverFullName",
      "nextApproverFundChanges",
      "nextApproverKerberos",
      "reimbursementLabel",
      "reimbursementEmployeeResidence",
      "reimbursementTravelDate",
      "reimbursementPersonalTime",
      "reimbursementComments",
      "reimbursementStatus",
      "approvalRequestUrl",
      "reimbursementRequestUrl"
    ];
    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'SettingsModel', 'NotificationModel');

  }

  
    /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
     async _onAppStateUpdate(state) {
      if ( this.id !== state.page ) return;
      await this.SettingsModel.getByCategory(this.settingsCategory);
  
      this.AppStateModel.setTitle('Email Settings');
      const breadcrumbs = [
        this.AppStateModel.store.breadcrumbs.home,
        this.AppStateModel.store.breadcrumbs.admin,
        this.AppStateModel.store.breadcrumbs[this.id]
      ];
      this.AppStateModel.setBreadcrumbs(breadcrumbs);
  
      // const d = await this.getPageData();
      // const hasError =  d.some(e => e.status === 'rejected' || e.value.state === 'error');
      // if( hasError ) {
      //   this.AppStateModel.showError(d);
      //   return;
      // }
      // this.AppStateModel.showLoaded(this.id);
    }

  /**
   * @description bound to SettingsModel settings-category-fetched event
   * @param {Object} e - cork-app-utils state where payload is an array of settings objects
   */
  _onSettingsCategoryFetched(e) {
    if ( e.category !== this.settingsCategory ) return;
    if ( e.state === 'loaded' ) {
      this.searchString = '';
      this._setSettingsProperty(e.payload);
      this.AppStateModel.showLoaded(this.id)
    } else if ( e.state === 'error' ) {
      this.AppStateModel.showError(e, 'Unable to load settings.');
    } else if ( e.state === 'loading' ) {
      this.AppStateModel.showLoading();
    }
  }
  
  /**
   * @description sets the element's settings property
   * which is used to render the inputs for the settings form on the page
   */
   _setSettingsProperty(settings) {
    if ( !settings || !Array.isArray(settings) ) {
      this.settings = [];
      return;
    }
    settings = settings.map(setting => {
      setting = {...setting};
      setting.hidden = false;
      setting.updated = false;
      return setting;
    }).sort((a, b) => {
      if ( a.settingsPageOrder === b.settingsPageOrder ) return 0;
      return a.settingsPageOrder < b.settingsPageOrder ? -1 : 1;
    });

    this.settings = settings;
    this.settingsHaveChanged = false;
    this.noSettings = settings.length === 0;
    this.requestUpdate();
  }

  sortSettings(){
    let body = this.settings.filter(set => set.key.includes("admin_email_body"));
    let subject = this.settings.filter(set => set.key.includes("admin_email_subject"));

    body = this.sort(body);
    subject = this.sort(subject);
    let newArray= [];

    if(body.length == subject.length) {
      body.map((e, i) => {
        let tempArray = []
        tempArray.push(e)
        tempArray.push(subject[i])
        newArray.push(tempArray)
      });
    }

    return newArray;
  }


  /**
   * @description bound to "use default value" checkbox change event
   */
   _onSettingDefaultToggle(settingsId){
    let setting = this.settings.find(s => s.settingsId === settingsId);
    if ( !setting ) return;
    setting.useDefaultValue = !setting.useDefaultValue;
    setting.updated = true;
    this.settingsHaveChanged = true;
    this.requestUpdate();
  }

    /**
   * @description bound to SettingsModel settings-updated event
   * Caches are automatically cleared as part of the 'SettingsModel.updateSettings' method
   */
     _onSettingsUpdated(e) {
      if ( e.state === 'loaded' ){
        this.AppStateModel.showToast({message: 'Email Settings updated', type: 'success'});
      } else if ( e.state === 'error' ) {
        this.AppStateModel.showToast({message: 'Email Settings update failed', type: 'error'});
      }
    }

  sort(item){
    item.sort((a, b) => {
      const A = a.key.toUpperCase(); // ignore upper and lowercase
      const B = b.key.toUpperCase(); // ignore upper and lowercase

      if (A < B) {
        return -1;
      }
      if (A > B) {
        return 1;
      }
    
      // names must be equal
      return 0;
    });
    return item;
  }

      /**
   * @description bound to setting value input event
   */
  _onSettingValueInput(settingsId, value){
    let setting = this.settings.find(s => s.settingsId === settingsId);
    if ( !setting ) return;
    setting.value = value;
    setting.updated = true;
    this.settingsHaveChanged = true;
    this.requestUpdate();
  }

  /**
   * @description bound to save button click event
   */
  _onSaveSettings(){
    if ( !this.settingsHaveChanged ) return;
    const settings = this.settings.filter(s => s.updated);
    this.SettingsModel.updateSettings(settings);
  }

  /**
   * @description bound to search form search event
   * does very basic 'includes' search on label, key, description, and keywords
   */
  _onSearch(e){
    this.searchString = e.detail.searchTerm;
    const s = this.searchString.trim().toLowerCase();

    for( let setting of this.settings ) {
      if ( !s ) {
        setting.hidden = false;
        continue;
      }
      const fields = [setting.label, setting.key, setting.description, setting.keywords];
      setting.hidden = fields.every(f => !f || !f.toLowerCase().includes(s));
    }
    this.noSettings = this.settings.every(s => s.hidden);
  }

  _onEmailUpdate(e){
    const page = this.pages.find(p => p.value === this.page);
    if ( !page ) return;
    const data = this[page.formProperty] || {};
  
    const { emailPrefix, bodyTemplate, subjectTemplate, disableNotification } = e.detail;
    data[`${emailPrefix}Body`] = bodyTemplate;
    data[`${emailPrefix}Subject`] = subjectTemplate;
    data[`${emailPrefix}Disable`] = disableNotification ? 'true' : '';
  
    this[page.formProperty] = {...data};
  
  }

  /**
   * @description clears search string and focuses search input
   * Bound to "Try another search term" link click event
   */
  clearAndFocusSearch(){
    this.searchString = '';
    for( let setting of this.settings ) {
      setting.hidden = false;
    }
    this.renderRoot.querySelector('ucd-theme-search-form').renderRoot.querySelector('input').value = '';
    this.renderRoot.querySelector('ucd-theme-search-form').renderRoot.querySelector('input').focus();
    this.noSettings = false;
  }


    /**
     * @description Get all data required for rendering this page
     */
    // async getPageData(){
  
    //   // need to ensure that employee search has been rendered before we can initialize it
    //   await this.waitController.waitForUpdate();
  
    //   const promises = [];
    //   promises.push(this.SettingsModel.getByCategory(this.settingsCategory))

    //   const resolvedPromises = await Promise.allSettled(promises);
  
    //   return resolvedPromises;
  
    // }

}




customElements.define('app-page-admin-email-settings', AppPageAdminEmailSettings);