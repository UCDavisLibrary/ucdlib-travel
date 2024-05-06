import { LitElement } from 'lit';
import {render} from "./app-page-admin-allocations-new.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";
import { createRef } from 'lit/directives/ref.js';

export default class AppPageAdminAllocationsNew extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.employeeSearchRef = createRef();
    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;

    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Add Employee Allocations');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
      this.AppStateModel.store.breadcrumbs['admin-allocations'],
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    const d = await this.getPageData();
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if( hasError ) {
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

    // need to ensure that employee search has been rendered before we can initialize it
    await this.waitController.waitForUpdate();

    const promises = [];
    promises.push(this.employeeSearchRef.value.init());
    const resolvedPromises = await Promise.allSettled(promises);

    // flatten resolved promises - employee search returns an array of promises
    const out = [];
    resolvedPromises.forEach(p => {
      if ( Array.isArray(p.value) ) {
        out.push(...p.value);
      } else {
        out.push(p);
      }
    });
    return out;

  }

}

customElements.define('app-page-admin-allocations-new', AppPageAdminAllocationsNew);
