import { LitElement } from 'lit';
import {render} from "./app-page-admin-email-settings.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";
import emailVariables from "../../../../lib/utils/emailVariables.js";
import "../../components/email-template.js";

/**
 * @class AppPageAdminEmailSettings
 * @description Admin page for managing email settings
 * @property {Array} settings - array of settings objects fetched from the settings model - must have the 'admin-settings' category
 * @property {String} searchString - search string used to do a browser-side search of the settings array
 * @property {Boolean} settingsHaveChanged - true if any settings have been updated by user
 * @property {Boolean} noSettings - true if there are no settings to display due to search filtering
 */
export default class AppPageAdminEmailSettings extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      settings: {type: Array},
      searchString: {type: String},
      settingsHaveChanged: {type: Boolean},
      noSettings: {type: Boolean}
    }
  }
 
  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'admin-email-settings';

    this.settings = [];
    this.searchString = '';
    this.emailForm = '';
    this.settingsHaveChanged = false;
    this.noSettings = false;
    this.formProperty = {};
    this.settingTypes = {};
    this.variableList = emailVariables.variableList;
    this.originalSettings = [];
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

    this.requestUpdate();
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

  toCamelCase(s){
    return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
          .replace('-', '')
          .replace('_', '');
    });

  }

  toKebabCase(s){
    return s.replaceAll("_", '-');
  }

  toUpper(s){
    let result = s.replace(/([A-Z])/g, " $1");
    if(result.includes("_")) result = result.replace('_', ' ');


    let arr = result.split(' ');
    var newarr = [];

    for (var x = 0; x < arr.length; x++) {
      newarr.push(arr[x].charAt(0).toUpperCase() + arr[x].slice(1));
    }
      
    let final = newarr.join(' ');

    return final;
  }

  getTemplatesVariables(){
    let vRes = []
    for (let v of this.variableList) {
      let finalResult = this.toUpper(v);
      vRes.push({key: v, label: finalResult });
    }

    return vRes;
  }

  _onEmailUpdate(e){
    const { emailPrefix, bodyTemplate, subjectTemplate } = e.detail;
    const data = {page: this.settingTypes[emailPrefix]} || {};

    let settingSubjectKey = "admin_email_subject_" + data.page;
    let settingBodyKey = "admin_email_body_" + data.page;
    let bodyIndex = this.settings.findIndex(obj => obj.key == settingBodyKey);
    let subjectIndex = this.settings.findIndex(obj => obj.key == settingSubjectKey);

    this.settings[subjectIndex].useDefaultValue = false;
    this.settings[bodyIndex].useDefaultValue = false;


    if(bodyTemplate != ''){
      this.settings[bodyIndex].value = bodyTemplate;
      this.settings[bodyIndex].updated = true;
    } else {
      this.settings[bodyIndex].useDefaultValue = true;
      this.settings[bodyIndex].value = '';
      this.settings[bodyIndex].updated = true;
    }

    if(subjectTemplate != ''){
      this.settings[subjectIndex].value = subjectTemplate;
      this.settings[subjectIndex].updated = true;
    } else {
      this.settings[subjectIndex].useDefaultValue = true;
      this.settings[subjectIndex].value = '';
      this.settings[subjectIndex].updated = true;
    }

    this.settingsHaveChanged = true;
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
  }e

  async _onFormSubmit(e) {
    e.preventDefault();
    
    this.settings.map(settings => {
      if(settings.updated) {
        this.SettingsModel.updateSettings(settings);
        settings.updated = false;
      }
    });

    this.requestUpdate();

  }

}




customElements.define('app-page-admin-email-settings', AppPageAdminEmailSettings);