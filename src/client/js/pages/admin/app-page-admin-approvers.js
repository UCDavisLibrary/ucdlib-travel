import { LitElement } from 'lit';
import {render} from "./app-page-admin-approvers.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from '@ucd-lib/theme-elements/utils/controllers/wait.js';
import { createRef } from 'lit/directives/ref.js';
import promiseUtils from '../../../../lib/utils/promiseUtils.js';

/**
 * @description Admin page for managing approver type and funding options
 */
export default class AppPageAdminApprovers extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.waitController = new WaitController(this);

    this.fundingSourceEle = createRef();
    this.approverTypeEle = createRef();


    this._injectModel('AppStateModel');
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
    const hasError = promiseUtils.hasError(d);
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

    const promises = [
      this.fundingSourceEle.value.init(),
      this.approverTypeEle.value.init()
    ];
    const resolvedPromises = await Promise.allSettled(promises);

    return promiseUtils.flattenAllSettledResults(resolvedPromises);

  }

  /**
   * @description bound to subnav item click event
   * @param {Custom Event} e
   * @returns
   */
  _onSubNavClick(e){
    let ref = '';
    if ( e.detail.linkText === 'Approver Types' ) {
      ref = this.approverTypeEle.value;
    } else if ( e.detail.linkText === 'Funding Sources' ) {
      ref = this.fundingSourceEle.value;
    }
    if ( !ref ) return;
    ref.scrollIntoView({behavior: "smooth"});
  }


}

customElements.define('app-page-admin-approvers', AppPageAdminApprovers);
