import { LitElement } from 'lit';
import { render } from "./app-page-admin-approval-requests.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";
import promiseUtils from '../../../../lib/utils/promiseUtils.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';
import typeTransform from "../../../../lib/utils/typeTransform.js";
import urlUtils from '../../../../lib/utils/urlUtils.js';

/**
 * AppPageAdminApprovalRequests
 * Admin page for managing approval requests.
 */
export default class AppPageAdminApprovalRequests extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      page: { type: Number },
      totalPages: { type: Number },
      approvalRequests: { type: Array },
      isCurrent: { type: Boolean },
      waitController: { type: Object },
      approvalStatuses: { type: Array },
      approvalStatus: { type: String },
      selectedApprovalRequestFilters: { type: Array },
      employeesInDB: { type: Array },
      selectedEmployee: { type: String },
      selectedEmployeeFilters: { type: Array },
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    // Initialize state
    this.totalPages = 1;
    this.page = 1;
    this.approvalRequests = [];
    this.waitController = new WaitController(this);
    this.approvalStatuses = applicationOptions.approvalStatuses;
    this.approvalStatus = '';
    this.employeesInDB = [];
    this.isCurrent = false;
    this.selectedApprovalRequestFilters = [];
    this.selectedEmployee = '';
    this.selectedEmployeeFilters = [];

    // Inject models
    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'AuthModel', 'EmployeeModel');
  }


  /**
   * connectedCallback lifecycle method
   * This is where we trigger employee fetch once the component is added to the DOM
   */
  connectedCallback() {
    super.connectedCallback();
    // Explicitly trigger the employee fetch
    this.EmployeeModel.getAllEmployees();
  }


  /**
   * Reset selected filters to default values
   */
  resetFilters() {
    this.selectedApprovalRequestFilters = [];
    this.selectedEmployeeFilters = [];
  }

  /**
   * Query approval requests using the current filter values
   */
  async query() {
    try {
      this.queryState = 'loading';

      // Inline query object
      const queryObject = {
        isCurrent: true,
        approvalStatus: this.selectedApprovalRequestFilters || '',
        employees: this.selectedEmployeeFilters || '',
        page: this.page
      };

      const result = await this.ApprovalRequestModel.query(queryObject);
      return result;
    } catch (error) {
      this.logger.debug('Error in querying approval requests:', error);
    }
  }

  /**
   * Handle app state update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if (this.id !== state.page) return;

    this._setPage(state);
    this._updateTitleAndBreadcrumbs();
    this._onEmployeesFetched(state);  // Automatically handles the state

    try {
      const data = await this.getPageData();
      const hasError = data.some(e => e.status === 'rejected' || (e.value && e.value.state === 'error'));

      if (hasError) {
        this.AppStateModel.showError(data, { ele: this });
        return;
      }

      this.AppStateModel.showLoaded(this.id);
    } catch (error) {
      this.logger.debug('Error in handling app state update:', error);
    }
  }

  /**
   * This method will be automatically wired up to the 'employees-fetched' event
   * when the model changes its state (loading, loaded, error).
   */
  _onEmployeesFetched(e) {
    if (e.state === 'loading') {
      // this.logger.debug('Employees are loading...');
    } else if (e.state === 'loaded') {
      // this.logger.debug('Employees successfully loaded:', e.payload);
      this._updateEmployeeList(e.payload);  // Update employee list without directly setting state
    } else if (e.state === 'error') {
      this.logger.debug('Error loading employees:', e.error);
      this._showError(e.error);  // Show error message or handle error
    }
  }

  /**
   * Update the employee list in the UI without directly manipulating state here.
   */
  _updateEmployeeList(employeeData) {
    // Handle the UI logic for displaying the employees.
    // Avoid directly mutating state in the view.
    this.employeesInDB = employeeData;  // State can still be set here, but separated from view logic.
    // Optionally, trigger any additional rendering if needed.
  }

/**
 * Fetch all required data for rendering the page
 */
async getPageData() {
  try {
    const queryObject = {
      isCurrent: true,
      approvalStatus: this.selectedApprovalRequestFilters || '',
      employees: this.selectedEmployeeFilters || '',
      page: this.page
    };

    const promises = [
      this.ApprovalRequestModel.query(queryObject)  // Fetch approval requests
    ];

    const resolvedPromises = await Promise.allSettled(promises);

    return promiseUtils.flattenAllSettledResults(resolvedPromises);

  } catch (error) {
    this.logger.debug('Error fetching page data:', error);
    return [];  // Return an empty array in case of failure
  }
}

  /**
   * Handle approval requests loading event.
   * @param {Event} e - Event containing approval request data.
   */
  _onApprovalRequestsRequested(e) {
    if (e.state !== 'loaded') return;

    if (!this.AppStateModel.isActivePage(this)) return;

    // Inline query object here.
    const queryObject = {
      isCurrent: true,
      approvalStatus: this.selectedApprovalRequestFilters || '',
      employees: this.selectedEmployeeFilters || '',
      page: this.page
    };

    const elementQueryString = urlUtils.queryObjectToKebabString(queryObject);
    if (e.query !== elementQueryString) return;

    this.approvalRequests = e.payload.data;
    this.totalPages = e.payload.totalPages;
  }

  /**
   * Set the page number from the AppStateModel state.
   * @param {Object} state - AppStateModel state.
   */
  _setPage(state) {
    this.page = typeTransform.toPositiveInt(state?.location?.query?.page) || 1;
  }

  /**
   * Event handler for filter changes.
   * Triggers a query to update results.
   * @param {Array} options - Selected options.
   * @param {String} prop - Property to update.
   * @param {Boolean} toInt - Convert values to integers before setting property.
   */
  _onFilterChange(options, prop, toInt) {
    this[prop] = options.map(option => toInt ? parseInt(option.value) : option.value);
    this.page = 1;
    this.results = [];
    this.maxPage = 1;
    this.query();
  }

  /**
   * Callback for pagination change.
   * @param {CustomEvent} e - Page-change event.
   */
  _onPageChange(e) {
    let url = this.AppStateModel.store.breadcrumbs[this.id].link;
    if (e.detail.page !== 1) {
      url += `?page=${e.detail.page}`;
    }
    this.AppStateModel.setLocation(url);
  }

  /**
   * Update page title and breadcrumbs.
   */
  _updateTitleAndBreadcrumbs() {
    this.AppStateModel.setTitle('All Approval Requests');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];

    this.AppStateModel.setBreadcrumbs(breadcrumbs);
  }

}

customElements.define('app-page-admin-approval-requests', AppPageAdminApprovalRequests);