import { LitElement } from 'lit';
import {render} from "./app-page-admin.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

/**
 * @description Admin home page
 * @param {Array} adminPages - local copy of active page objects from AdminPagesModel
 */
export default class AppPageAdmin extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {
  static get properties() {
    return {
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'admin-page';

    this._injectModel('AppStateModel','SettingsModel');
  }

    /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
    async _onAppStateUpdate(state) {
      if ( this.id !== state.page ) return;

      this.AppStateModel.setTitle('Application Administration');

      const breadcrumbs = [
        this.AppStateModel.store.breadcrumbs.home,
        this.AppStateModel.store.breadcrumbs.admin
      ];
      this.AppStateModel.setBreadcrumbs(breadcrumbs);

      const d = await this.getPageData();
      const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
      if ( hasError ) {
        this.AppStateModel.showError(d);
        return;
      }
  
      this.AppStateModel.showLoaded(this.id);
      this.requestUpdate(); 
    }

  /**
   * @description Get all data required for rendering this page
   */
      async getPageData(){
        const promises = [];
        promises.push(this.SettingsModel.getByCategory(this.settingsCategory));
        const resolvedPromises = await Promise.allSettled(promises);
        return resolvedPromises;
      }

}

customElements.define('app-page-admin', AppPageAdmin);
