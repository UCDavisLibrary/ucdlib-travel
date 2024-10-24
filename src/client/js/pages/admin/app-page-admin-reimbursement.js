import { LitElement } from 'lit';
import {render} from "./app-page-admin-reimbursement.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

/**
 * @class AppPageAdminReimbursement
 * @description Admin page for viewing all reimbursement requests
 * @property {Array} selectedStatusFilters - list of status filter values to be applied to query
 * @property {Array} results - list of reimbursement requests returned by query
 * @property {Number} page - current page number of query results
 * @property {Number} maxPage - total number of pages returned by query
 * @property {String} _queryState - loading, loaded, or no-results
 */
export default class AppPageAdminReimbursement extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      selectedStatusFilters: {type: Array},
      results: {type: Array},
      page: {type: Number},
      maxPage: {type: Number},
      _queryState: {type: String}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.selectedStatusFilters = [];
    this.results = [];
    this.page = 1;
    this.maxPage = 1;

    this._injectModel('AppStateModel', 'ReimbursementRequestModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;

    this.AppStateModel.setTitle('Reimbursement Requests');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    this.query();
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
   * @description Query reimbursement requests using current filter values
   */
  async query(){
    this._queryState = 'loading';
    const args = {
      page: this.page,
      includeApprovalRequest: true
    }

    if ( this.selectedStatusFilters.length ) {
      args.status = this.selectedStatusFilters;
    }

    await this.ReimbursementRequestModel.query(args);
  }

  /**
   * @description bound to ReimbursementRequestModel reimbursement-request-requested event
   * Fires when a query is done
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onReimbursementRequestRequested(e) {
    if ( !this.AppStateModel.isActivePage(this) ) return;
    if ( e.state === 'error' ) {
      this._queryState = 'error';
      return;
    }
    if ( e.state === 'loaded' ){
      this._queryState = parseInt(e.payload.total) ? 'loaded' : 'no-results';
      this.results = e.payload.data;
      this.maxPage = e.payload.totalPages;
    }
  }

  /**
   * @description Event handler for when the page changes
   */
  _onPageChange(e){
    this.page = e.detail.page;
    this.results = [];
    this.query();
  }

}

customElements.define('app-page-admin-reimbursement', AppPageAdminReimbursement);
