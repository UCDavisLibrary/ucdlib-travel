import { LitElement } from 'lit';
import {render} from "./app-page-admin-email-settings.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";
import ValidationHandler from "../../utils/ValidationHandler.js";


import "../../components/app-questions-or-comments.js";
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
    this.settingsCategory = 'admin-email';

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'SettingsModel');

  }


    /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
     async _onAppStateUpdate(state) {
      if ( this.id !== state.page ) return;
  
      this.AppStateModel.showLoading();
  
      this.AppStateModel.setTitle('Approvers and Funding Sources');
      const breadcrumbs = [
        this.AppStateModel.store.breadcrumbs.home,
        this.AppStateModel.store.breadcrumbs.admin,
        this.AppStateModel.store.breadcrumbs[this.id]
      ];
      this.AppStateModel.setBreadcrumbs(breadcrumbs);
  
      const d = await this.getPageData();
      const hasError =  d.some(e => e.status === 'rejected' || e.value.state === 'error');
      if( hasError ) {
        this.AppStateModel.showError(d);
        return;
      }
      this.AppStateModel.showLoaded(this.id);
    }
  
    /**
     * @description Get all data required for rendering this page
     */
    async getPageData(){
  
      // need to ensure that employee search has been rendered before we can initialize it
      await this.waitController.waitForUpdate();
  
      const promises = [];
      promises.push(this.SettingsModel.getByCategory(this.settingsCategory))

      const resolvedPromises = await Promise.allSettled(promises);
  
      return resolvedPromises;
  
    }

}

customElements.define('app-page-admin-email-settings', AppPageAdminEmailSettings);