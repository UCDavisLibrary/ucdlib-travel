import { LitElement } from 'lit';
import {render} from "./app-page-approver-landing.tpl.js";

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import typeTransform from "../../../../lib/utils/typeTransform.js";
import urlUtils from '../../../../lib/utils/urlUtils.js';

/**
 * @description Page for approvers to view all of their approval requests past and present
 * @property {Object} queryArgs - query arguments for fetching approval requests for approver
 * @property {Number} page - current page number
 * @property {Number} totalPages - total number of pages of approval requests
 * @property {Array} approvalRequests - list of approval requests. Set from ApprovalRequestModel
 */
export default class AppPageApproverLanding extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      queryArgs: {type: Object},
      page: {type: Number},
      totalPages: {type: Number},
      approvalRequests: {type: Array},
      filters: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.totalPages = 1;
    this.approvalRequests = [];
    this.waitController = new WaitController(this);
    this.filters = [];

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'AuthModel');

    this.queryArgs = {
      isCurrent: true,
      approvers: this.AuthModel.getToken().id,
      approvalStatus: [],
      employees: [],
      fiscalYear: [],
      excludeDrafts: true,
      page: 1
    };
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Approve Requests');

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
      this.ApprovalRequestModel.getFilters('approver')
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  async query(){
    this.AppStateModel.showLoading();
    const r = await this.ApprovalRequestModel.query(this.queryArgs)
    if ( r.state === 'error' ){
      this.AppStateModel.showError(r, {ele: this});
      return;
    }
    this.AppStateModel.showLoaded(this.id);
  }

  _onApprovalRequestFiltersUpdate(e){
    if ( e.state !== 'loaded' || e.userType != 'approver' ) return;
    this.filters = e.payload;
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
   * @description callback for when user clicks on pagination
   * @param {CustomEvent} e - page-change event
   */
  _onPageChange(e){
    this.queryArgs.page = e.detail.page;
    this.query();
  }

  _onFilterChange(options, prop, toInt) {
    this.queryArgs[prop] = options.map(option => toInt ? parseInt(option.value) : option.value);
    this.queryArgs.page = 1;
    this.approvalRequests = [];
    this.totalPages = 1;
    this.query();
    this.requestUpdate();
  }

}

customElements.define('app-page-approver-landing', AppPageApproverLanding);
