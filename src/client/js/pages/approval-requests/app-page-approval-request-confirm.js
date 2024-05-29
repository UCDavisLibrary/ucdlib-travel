import { LitElement } from 'lit';
import {render } from "./app-page-approval-request-confirm.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class AppPageApprovalRequestConfirm extends Mixin(LitElement)
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
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('New Approval Request Confirmation');

    // todo set breadcrumbs based on approvalRequestId
    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      //this.AppStateModel.store.breadcrumbs['approval-requests'],
      //this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    // const d = await this.getPageData();
    // const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    // if ( hasError ) {
    //   this.AppStateModel.showError(d);
    //   return;
    // }

    this.AppStateModel.showLoaded(this.id);
  }

}

customElements.define('app-page-approval-request-confirm', AppPageApprovalRequestConfirm);
