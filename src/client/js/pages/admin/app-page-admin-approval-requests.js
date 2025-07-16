import { LitElement } from 'lit';
import { render } from "./app-page-admin-approval-requests.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";
import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import urlUtils from '../../../../lib/utils/urlUtils.js';

/**
 * AppPageAdminApprovalRequests
 * Admin page for viewing all approval requests.
 * @property {Object} queryArgs - Query arguments for fetching approval requests.
 * @property {Number} totalPages - Total number of pages of approval requests based on current filters.
 * @property {Array} approvalRequests - List of approval requests fetched based on queryArgs.
 * @property {Array} filters - List of filters available for approval requests.
 */
export default class AppPageAdminApprovalRequests extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      queryArgs: { type: Object },
      totalPages: { type: Number },
      approvalRequests: { type: Array },
      filters: { type: Array }
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.totalPages = 1;
    this.approvalRequests = [];
    this.waitController = new WaitController(this);

    this.queryArgs = {
      isCurrent: true,
      approvalStatus: [],
      employees: [],
      fiscalYear: [],
      page: 1
    };
    this.filters = [];

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'AuthModel', 'EmployeeModel');
  }

  /**
   * @description Query approval requests based on current filters and page.
   * @returns
   */
  async query(){
    this.AppStateModel.showLoading();
    const r = await this.ApprovalRequestModel.query(this.queryArgs)
    if ( r.state === 'error' ){
      this.AppStateModel.showError(r, {ele: this});
      return;
    }
    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * Handle app state update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('All Approval Requests');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
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
      this.ApprovalRequestModel.getFilters('admin')
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  /**
   * @description callback for when approval request filters are updated
   * @param {Object} e - event object containing state and payload
   * @returns
   */
  _onApprovalRequestFiltersUpdate(e){
    if ( e.state !== 'loaded' || e.userType != 'admin' ) return;
    this.filters = e.payload;
  }

  /**
   * @description callback for when approval requests have been requested
   * @param {Object} e - event object containing state and payload
   * @returns
   */
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
   * @description bound to change event of filters
   * @param {Array} options - The selected options from the filter
   * @param {String} prop - The property to update in the queryArgs
   * @param {Boolean} toInt - Whether to convert the values to integers
   */
  _onFilterChange(options, prop, toInt) {
    this.queryArgs[prop] = options.map(option => toInt ? parseInt(option.value) : option.value);
    this.queryArgs.page = 1;
    this.approvalRequests = [];
    this.totalPages = 1;
    this.query();
    this.requestUpdate();
  }

  /**
   * @description callback for when user clicks on pagination
   * @param {CustomEvent} e - page-change event
   */
  _onPageChange(e){
    this.queryArgs.page = e.detail.page;
    this.query();
  }

}

customElements.define('app-page-admin-approval-requests', AppPageAdminApprovalRequests);
