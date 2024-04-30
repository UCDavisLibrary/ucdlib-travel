import { LitElement } from 'lit';
import {render} from "./app-page-admin-line-items.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class AppPageAdminLineItems extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      lineItems : {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'admin-line-items';
    this.lineItems = [];

    this._injectModel('AppStateModel', 'SettingsModel', 'LineItemsModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Line Items');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    try {
      const d = await this.getPageData();
      const hasError = d.some(e => e.state === 'error');
      if ( !hasError ) this.AppStateModel.showLoaded(this.id);
      this.requestUpdate();
    } catch(e) {
      this.AppStateModel.showError(this.id);
    }

  }

  /**
   * @description bound to LineItemsModel ACTIVE_LINE_ITEMS_FETCHED event
   * fires when active line items are fetched from the server
   */
  _onActiveLineItemsFetched(e){
    if ( e.state !== 'loaded' ) return;
    this.lineItems = e.payload.map(item => {
      item = {...item};
      item.editing = false;
      return item;
    });
    console.log(this.lineItems);
  }

  /**
   * @description Get all data required for rendering this page
   */
    async getPageData(){
      const promises = [];
      promises.push(this.SettingsModel.getByCategory(this.settingsCategory));
      promises.push(this.LineItemsModel.getActiveLineItems());
      const resolvedPromises = await Promise.all(promises);
      return resolvedPromises;
    }


}

customElements.define('app-page-admin-line-items', AppPageAdminLineItems);
