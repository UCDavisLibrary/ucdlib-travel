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

    this.AppStateModel.showLoading();
    this._setPage(state);
    this._updateTitleAndBreadcrumbs();

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
   * Fetch all employees from EmployeeModel
   */
  async getAllEmployees() {
    try {
      const raw = await this.EmployeeModel.getAllEmployees();
  
      if (raw && raw.payload) {
        this.employeesInDB = raw.payload;
        return raw;  // Return the raw response so it can be used in Promise.allSettled()
      } else {
        console.debug('No employees found or invalid response structure');
        this.employeesInDB = [];
        return { state: 'loaded', payload: [] };  // Return a fallback structure
      }
    } catch (error) {
      this.logger.debug('Error fetching employees:', error);
      this.employeesInDB = [];
      return { state: 'error', payload: [] };  // Return error state in case of failure
    }
  }

  /**
   * Fetch all required data for rendering the page
   */
  async getPageData() {
    try {
      // Inline query object here as well
      const queryObject = {
        isCurrent: true,
        approvalStatus: this.selectedApprovalRequestFilters || '',
        employees: this.selectedEmployeeFilters || '',
        page: this.page
      };

      const promises = [
        this.getAllEmployees(),  // Fetch employees
        this.ApprovalRequestModel.query(queryObject)  // Fetch approval requests
      ];
  
      const resolvedPromises = await Promise.allSettled(promises);
      // this.logger.debug('Resolved promises:', resolvedPromises);  // For debugging
  
      // Handle each result separately
      const employeeResult = resolvedPromises[0];
      const approvalRequestResult = resolvedPromises[1];
  
      // Check if employees were loaded successfully
      if (employeeResult.status === 'fulfilled' && employeeResult.value.state === 'loaded') {
        // this.logger.debug('Employees loaded:', employeeResult.value.payload);
      } else {
        this.logger.debug('Failed to load employees:', employeeResult.reason || employeeResult.value);
      }
  
      // Process approval requests
      if (approvalRequestResult.status === 'fulfilled') {
        this.approvalRequests = approvalRequestResult.value.data || [];
        this.totalPages = approvalRequestResult.value.totalPages || 1;
      } else {
        this.logger.debug('Failed to load approval requests:', approvalRequestResult.reason);
      }
  
      return promiseUtils.flattenAllSettledResults(resolvedPromises);
  
    } catch (error) {
      this.logger.debug('Error fetching page data:', error);
      return [];  // Return an empty array in case of failure
    }
  }

  /**
   * Handle approval requests loading event
   * @param {Event} e - Event containing approval request data
   */
  _onApprovalRequestsRequested(e) {
    if (e.state !== 'loaded') return;

    if (!this.AppStateModel.isActivePage(this)) return;

    // Inline query object here
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
   * Set the page number from the AppStateModel state
   * @param {Object} state - AppStateModel state
   */
  _setPage(state) {
    this.page = typeTransform.toPositiveInt(state?.location?.query?.page) || 1;
  }

  /**
   * Event handler for filter changes.
   * Triggers a query to update results.
   * @param {Array} options - Selected options
   * @param {String} prop - Property to update
   * @param {Boolean} toInt - Convert values to integers before setting property
   */
  _onFilterChange(options, prop, toInt) {
    this[prop] = options.map(option => toInt ? parseInt(option.value) : option.value);
    this.page = 1;
    this.results = [];
    this.maxPage = 1;
    this.query();
  }

  /**
   * Callback for pagination change
   * @param {CustomEvent} e - Page-change event
   */
  _onPageChange(e) {
    let url = this.AppStateModel.store.breadcrumbs[this.id].link;
    if (e.detail.page !== 1) {
      url += `?page=${e.detail.page}`;
    }
    this.AppStateModel.setLocation(url);
  }

  /**
   * Update page title and breadcrumbs
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