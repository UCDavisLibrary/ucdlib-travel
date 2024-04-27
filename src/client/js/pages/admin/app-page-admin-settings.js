import { LitElement } from 'lit';
import {render} from "./app-page-admin-settings.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class AppPageAdminSettings extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      settings: {type: Array},
      searchString: {type: String}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.settingsCategory = 'admin-settings';
    this.settings = [];
    this.searchString = '';

    this._injectModel('AppStateModel', 'SettingsModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('General Settings');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    this.SettingsModel.getByCategory(this.settingsCategory);
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
    console.log('settings', settings);
  }

  _onSettingDefaultToggle(settingsId){
    let setting = this.settings.find(s => s.settingsId === settingsId);
    if ( !setting ) return;
    setting.useDefaultValue = !setting.useDefaultValue;
    setting.updated = true;
    this.requestUpdate();
    console.log('setting', setting);
  }

  _onSettingValueChange(settingsId, value){
    let setting = this.settings.find(s => s.settingsId === settingsId);
    if ( !setting ) return;
    setting.value = value;
    setting.updated = true;
    this.requestUpdate();
    console.log('setting', setting);
  }

}

customElements.define('app-page-admin-settings', AppPageAdminSettings);
