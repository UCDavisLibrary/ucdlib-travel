import { LitElement } from 'lit';
import { render } from "./app-page-home.tpl.js";

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../lib/utils/promiseUtils.js';
import applicationOptions from '../../../lib/utils/applicationOptions.js';
import typeTransform from "../../../lib/utils/typeTransform.js";
import urlUtils from '../../../lib/utils/urlUtils.js';
/**
 * @description Element for displaying the home page
 * @param {Object} ownQueryArgs - query arguments for approval requests submitted BY user
 * @param {Number} ownPage - page number for approval requests submitted BY user
 * @param {Number} ownTotalPages - total number of pages for approval requests submitted BY user
 * @param {Array} ownApprovalRequests - approval requests submitted BY user
 * @param {Object} approverQueryArgs - query arguments for approval requests submitted TO user
 * @param {Number} approverPage - page number for approval requests submitted TO user
 * @param {Number} approverTotalPages - total number of pages for approval requests submitted TO user
 * @param {Array} approverApprovalRequests - approval requests submitted TO user
 */
export default class AppPageHome extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      ownQueryArgs: {type: Object},
      ownPage: {type: Number},
      ownTotalPages: {type: Number},
      ownApprovalRequests: {type: Array},
      approverQueryArgs: {type: Object},
      approverPage: {type: Number},
      approverTotalPages: {type: Number},
      approverApprovalRequests: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'AuthModel', 'SettingsModel');

    // properties for approval requests submitted BY user
    this.ownTotalPages = 1;
    this.ownPage = 1;
    this.ownApprovalRequests = [];
    this.ownQueryArgs = {
      activeOnly: true,
      employees: this.AuthModel.getToken().id,
      page: this.page
    };

    // properties for approval requests submitted TO user
    this.approverTotalPages = 1;
    this.approverPage = 1;
    this.approverApprovalRequests = [];
    this.approverQueryArgs = {
      isCurrent: true,
      approvers: this.AuthModel.getToken().id,
      approvalStatus: applicationOptions.approvalStatuses.filter(s => s.isActive).map(s => s.value),
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
    this.ownQueryArgs.page = this.ownPage;
    this.approverQueryArgs.page = this.approverPage;

    this.AppStateModel.setTitle({show: false});
    this.AppStateModel.setBreadcrumbs({show: false});

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
      this.ApprovalRequestModel.query(this.ownQueryArgs),
      this.ApprovalRequestModel.query(this.approverQueryArgs),
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  /**
   * @description bound to ApprovalRequestModel approval-requests-requested event
   * @param {Object} e - cork-app-utils event
   * @returns
   */
  _onApprovalRequestsRequested(e){
    if ( e.state !== 'loaded' ) return;

    // check that request was issue by this element
    if ( !this.AppStateModel.isActivePage(this) ) return;

    if ( e.query === urlUtils.queryObjectToKebabString(this.ownQueryArgs) ) {
      this.ownApprovalRequests = e.payload.data;
      this.ownTotalPages = e.payload.totalPages;
    }

    if ( e.query === urlUtils.queryObjectToKebabString(this.approverQueryArgs) ) {
      this.approverApprovalRequests = e.payload.data;
      this.approverTotalPages = e.payload.totalPages;
    }
  }

  /**
   * @description set the page number from the AppStateModel state
   * @param {Object} state - AppStateModel state
   */
  _setPage(state){
    this.ownPage = typeTransform.toPositiveInt(state?.location?.query?.['own-page']) || 1;
    this.approverPage = typeTransform.toPositiveInt(state?.location?.query?.['approver-page']) || 1;
  }

  /**
   * @description callback for when user clicks on pagination
   * @param {CustomEvent} e - page-change event
   */
  _onPageChange(e, queryParam){
   let url = '/';
   const searchParams = new URLSearchParams(window.location.search);
    if ( e.detail.page !== 1 ) {
      searchParams.set(queryParam, e.detail.page);
    } else {
      searchParams.delete(queryParam);
    }
    url += searchParams.toString() ? '?' + searchParams.toString() : '';
    this.AppStateModel.setLocation(url);
  }


}

customElements.define('app-page-home', AppPageHome);
