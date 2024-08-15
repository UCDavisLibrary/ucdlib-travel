import { LitElement } from 'lit';
import {render} from "./app-page-admin-settings.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

/**
 * @class AppPageAdminSettings
 * @description Page for updating general application settings - only accessible to admin users
 * @property {Array} settings - array of settings objects fetched from the settings model - must have the 'admin-settings' category
 * @property {String} searchString - search string used to do a browser-side search of the settings array
 * @property {Boolean} settingsHaveChanged - true if any settings have been updated by user
 * @property {Boolean} noSettings - true if there are no settings to display due to search filtering
 */
export default class AppPageAdminSettings extends Mixin(LitElement)
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

    this.settingsCategory = 'admin-settings';
    this.settings = [];
    this.searchString = '';
    this.settingsHaveChanged = false;
    this.noSettings = false;

    this._injectModel('AppStateModel', 'SettingsModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.SettingsModel.getByCategory(this.settingsCategory);

    this.AppStateModel.setTitle('General Settings');

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
      this.AppStateModel.showError(e, {ele: this, fallbackMessage: 'Unable to load settings.'});
    } else if ( e.state === 'loading' ) {
      this.AppStateModel.showLoading();
    }
  }

  /**
   * @description bound to SettingsModel settings-updated event
   * Caches are automatically cleared as part of the 'SettingsModel.updateSettings' method
   */
  _onSettingsUpdated(e) {
    if ( e.state === 'loaded' ){
      this.AppStateModel.showToast({message: 'Settings updated', type: 'success'});
    } else if ( e.state === 'error' ) {
      this.AppStateModel.showToast({message: 'Settings update failed', type: 'error'});
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

}

customElements.define('app-page-admin-settings', AppPageAdminSettings);
