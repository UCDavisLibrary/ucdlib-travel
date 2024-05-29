import { LitElement } from 'lit';
import {render} from "./app-page-admin-approvers.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import "../../components/app-approver-type.js"
export default class AppPageAdminApprovers extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'admin-approver-type';

    this._injectModel('AppStateModel', 'SettingsModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;

    this.AppStateModel.setTitle('Approvers and Funding Sources');
    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

   


  }


}

customElements.define('app-page-admin-approvers', AppPageAdminApprovers);
