import { LitElement } from 'lit';
import {render} from "./app-page-admin.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

/**
 * @description Admin home page
 * @param {Array} adminPages - local copy of active page objects from AdminPagesModel
 * @param {Object} newAdminPage - new admin page object being created
 */
export default class AppPageAdmin extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {
  static get properties() {
    return {
      adminPages: {type: Array},
      newAdminPage: {type: Object},
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'admin-pages';
    this.adminPages = [];
    this.newAdminPage = {};

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel','SettingsModel','AdminPagesModel');
  }

    /**
   * @description lit lifecycle method
   */
    willUpdate(changedProps) {
      if ( changedProps.has('newAdminPage') ) {
        this.showNewAdminPageForm = this.newAdminPage && Object.keys(this.newAdminPage).length > 0;
      }
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
    }

      /**
   * @description Get all data required for rendering this page
   */
      async getPageData(){
        const promises = [];
        promises.push(this.SettingsModel.getByCategory(this.settingsCategory));
        promises.push(this.LineItemsModel.getActiveLineItems());
        const resolvedPromises = await Promise.allSettled(promises);
        return resolvedPromises;
      }

}

customElements.define('app-page-admin', AppPageAdmin);
