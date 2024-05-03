import { LitElement } from 'lit';
import {render} from "./app-page-admin-allocations-new.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class AppPageAdminAllocationsNew extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
    async _onAppStateUpdate(state) {
      if ( this.id !== state.page ) return;
  
      this.AppStateModel.setTitle('Add Employee Allocations');
  
      const breadcrumbs = [
        this.AppStateModel.store.breadcrumbs.home,
        this.AppStateModel.store.breadcrumbs.admin,
        this.AppStateModel.store.breadcrumbs['admin-allocations'],
        this.AppStateModel.store.breadcrumbs[this.id]
      ];
      this.AppStateModel.setBreadcrumbs(breadcrumbs);
    }

}

customElements.define('app-page-admin-allocations-new', AppPageAdminAllocationsNew);