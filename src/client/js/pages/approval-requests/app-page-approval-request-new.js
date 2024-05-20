import { LitElement } from 'lit';
import {render} from "./app-page-approval-request-new.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import ValidationHandler from "../../utils/ValidationHandler.js";

export default class AppPageApprovalRequestNew extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      revisionId: {type: Number},
      label: {type: String}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.revisionId = 0;
    this.settingsCategory = 'approval-requests';

    this._injectModel('AppStateModel', 'SettingsModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('New Approval Request');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs['approval-requests'],
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    this._setRevisionId(state);

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

  async _onSubmit(e){
    e.preventDefault();
    console.log('submit');
  }

  /**
   * @description Reset form state
   */
  resetForm(){
    this.label = '';
    this.validationHandler = new ValidationHandler();
    this.requestUpdate();
  }

  /**
   * @description Set revisionId property from App State location (the url)
   * @param {Object} state - AppStateModel state
   */
  _setRevisionId(state) {
    let revisionId = Number(state?.location?.path?.[2]);
    this.revisionId = Number.isInteger(revisionId) && revisionId > 0 ? revisionId : 0;
  }

}

customElements.define('app-page-approval-request-new', AppPageApprovalRequestNew);
