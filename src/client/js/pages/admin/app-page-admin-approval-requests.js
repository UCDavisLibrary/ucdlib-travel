import { LitElement } from 'lit';
import {render} from "./app-page-admin-approval-requests.tpl.js";
import { createRef } from 'lit/directives/ref.js';

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';
import typeTransform from "../../../../lib/utils/typeTransform.js";
import urlUtils from '../../../../lib/utils/urlUtils.js';

export default class AppPageAdminApprovalRequests extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      queryArgs: {type: Object},
      page: {type: Number},
      totalPages: {type: Number},
      approvalRequests: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.totalPages = 1;
    this.page = 1;
    this.approvalRequests = [];
    this.draftListSelectRef = createRef();
    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'AuthModel');

    this.queryArgs = {
      isCurrent: true,
      employees: this.AuthModel.getToken().id,
      approvalStatus: applicationOptions.approvalStatuses.filter(s => s.value != 'draft').map(s => s.value),
      page: this.page
    };
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();
    this._setPage(state);
    this.queryArgs.page = this.page;

    this.AppStateModel.setTitle('Your Approval Requests');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    const d = await this.getPageData();
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if ( hasError ) {
      this.AppStateModel.showError(d, {ele: this});
      return;
    }
    await this.waitController.waitForFrames(5);

    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){
    await this.waitController.waitForUpdate();

    const promises = [
      this.ApprovalRequestModel.query(this.queryArgs),
      this.draftListSelectRef.value.init()
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  _onApprovalRequestsRequested(e){
    if ( e.state !== 'loaded' ) return;

    // check that request was issue by this element
    if ( !this.AppStateModel.isActivePage(this) ) return;
    const elementQueryString = urlUtils.queryObjectToKebabString(this.queryArgs);
    if ( e.query !== elementQueryString ) return;

    this.approvalRequests = e.payload.data;
    this.totalPages = e.payload.totalPages;
  }

  /**
   * @description set the page number from the AppStateModel state
   * @param {Object} state - AppStateModel state
   */
  _setPage(state){
    this.page = typeTransform.toPositiveInt(state?.location?.query?.page) || 1;
  }

  /**
   * @description callback for when user clicks on pagination
   * @param {CustomEvent} e - page-change event
   */
  _onPageChange(e){
    let url = this.AppStateModel.store.breadcrumbs[this.id].link;
    if ( e.detail.page !== 1 ) {
      url += '?page='+e.detail.page;
    }
    this.AppStateModel.setLocation(url);
  }

}

customElements.define('app-page-admin-approval-requests', AppPageAdminApprovalRequests);
