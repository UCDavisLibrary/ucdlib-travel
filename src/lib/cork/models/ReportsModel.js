import {BaseModel} from '@ucd-lib/cork-app-utils';
import ReportsService from '../services/ReportsService.js';
import ReportsStore from '../stores/ReportsStore.js';

import urlUtils from '../../utils/urlUtils.js';

class ReportsModel extends BaseModel {

  constructor() {
    super();

    this.store = ReportsStore;
    this.service = ReportsService;

    this.register('ReportsModel');
  }

  async getReport(query={}) {
    const queryString = urlUtils.queryObjectToKebabString(query);

    let state = this.store.data.reports[queryString];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getReport(queryString);
      }
    } catch(e) {}

    this.store.emit(this.store.events.REPORT_REQUESTED, this.store.data.reports[queryString]);

    return this.store.data.reports[queryString];
  }

  /**
   * @description Get the reports access level of the user
   * @returns {Object} {hasAccess: Boolean, departmentRestrictions: Array}
   */
  async getAccessLevel() {
    let state = this.store.data.accessLevel;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getAccessLevel();
      }
    } catch(e) {}

    return this.store.data.accessLevel;
  }

  /**
   * @description Get the filters for the reports for the current user
   * @returns {Object} {state: String, payload: Array}
   */
  async getFilters() {
    let state = this.store.data.filters;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getFilters();
      }
    } catch(e) {}

    return this.store.data.filters;
  }

}

const model = new ReportsModel();
export default model;
