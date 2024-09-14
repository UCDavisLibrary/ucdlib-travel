import { LitElement } from 'lit';
import {render} from "./app-page-admin-approval-requests.tpl.js";
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
      approvalRequests: {type: Array},
      isCurrent: {type: Boolean},
      waitController: {type: Object},
      approvalStatuses: {type: Array},
      approvalStatus: {type: String},
      selectedApprovalRequestFilters: {type: Array},
      employeesInDB: {type: Array},
      selectedEmployeesFromDB: {type: Array},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.totalPages = 1;
    this.page = 1;
    this.approvalRequests = [];
    this.waitController = new WaitController(this);
    this.approvalStatuses = applicationOptions.approvalStatuses;
    this.employeesInDB = [];
    this.isCurrent = false;
    this.selectedApprovalRequestFilters = [];
    this.selectedEmployeesFromDB = [];

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'AuthModel', 'EmployeeModel');
  }

    /**
   * @description Reset selected filters to default values
   */
    resetFilters() {
      this.selectedApprovalRequestFilters = [];
    }

      /**
   * @description Query employee allocations using current filter values
   */
  async query(values){
    this.queryState = 'loading';
    return await this.ApprovalRequestModel.query(this._queryObject(values));
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();
    this._setPage(state);
    this._queryObject().page = this.page;

    this.AppStateModel.setTitle('All Approval Requests');

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
   * @description Construct query object for ApprovalRequestModel query from element properties
   */
    _queryObject(values){
      return {
        isCurrent: true,
        approvalStatus: this.selectedApprovalRequestFilters,
        page: this.page
      };
    }

  /**
   * @description Get all data required for rendering this page
   */
  async getPageData(){
    await this.waitController.waitForUpdate();
    this.employeesInDB = await this.EmployeeModel.getAllEmployees();
    console.log(JSON.stringify(this.employeesInDB));
    const promises = [
      this.ApprovalRequestModel.query(this._queryObject()),
    ]
    const resolvedPromises = await Promise.allSettled(promises);
    return promiseUtils.flattenAllSettledResults(resolvedPromises);
  }

  _onApprovalRequestsRequested(e){
    if ( e.state !== 'loaded' ) return;

    // check that request was issue by this element
    if ( !this.AppStateModel.isActivePage(this) ) return;
    const elementQueryString = urlUtils.queryObjectToKebabString(this._queryObject());
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
   * @description Event handler for filter changes. Triggers a query to update results
   * @param {Array} options - selected options
   * @param {String} prop - property to update
   * @param {Boolean} toInt - convert values to integers before setting property
   */
  _onFilterChange(options, prop, toInt){
    let values = options.map(option => toInt ? parseInt(option.value) : option.value);

    this[prop] = values;

    this.page = 1;
    this.results = [];
    this.maxPage = 1;

    this.query();

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
