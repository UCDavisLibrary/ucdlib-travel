import { LitElement } from 'lit';
import {render} from "./app-page-approval-requests.tpl.js";
import { createRef } from 'lit/directives/ref.js';

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";

import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';
import typeTransform from "../../../../lib/utils/typeTransform.js";
import urlUtils from '../../../../lib/utils/urlUtils.js';

export default class AppPageApprovalRequests extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      queryArgs: {type: Object},
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
    this.draftListSelectRef = createRef();
    this.allocationSummaryRef = createRef();
    this.waitController = new WaitController(this);
    this.filters = [];

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'AuthModel');

    this.queryArgs = {
      isCurrent: true,
      employees: this.AuthModel.getToken().id,
      approvalStatus: [],
      fiscalYear: [],
      reimbursementStatus: [],
      page: 1
    };
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

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

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
      this.ApprovalRequestModel.getFilters('submitter'),
      this.allocationSummaryRef.value.init(),
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

  _onApprovalRequestFiltersUpdate(e){
    if ( e.state !== 'loaded' || e.userType != 'submitter' ) return;
    this.filters = e.payload;
  }

}

customElements.define('app-page-approval-requests', AppPageApprovalRequests);
