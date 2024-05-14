import {BaseModel} from '@ucd-lib/cork-app-utils';
import EmployeeAllocationService from '../services/EmployeeAllocationService.js';
import EmployeeAllocationStore from '../stores/EmployeeAllocationStore.js';

import urlUtils from '../../utils/urlUtils.js';

/**
 * @class EmployeeAllocationModel
 * @description Model for employee allocations
 * $ amount allocated to an employee for a specific funding source and time period
 */
class EmployeeAllocationModel extends BaseModel {

  constructor() {
    super();

    this.store = EmployeeAllocationStore;
    this.service = EmployeeAllocationService;

    this.register('EmployeeAllocationModel');
  }

  async query(query={}){

    const queryString = this.queryString(query);

    let state = this.store.data.fetched[queryString];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.query(queryString);
      }
    } catch(e) {}

    this.store.emit(this.store.events.EMPLOYEE_ALLOCATIONS_REQUESTED, this.store.data.fetched[queryString]);

    return this.store.data.fetched[queryString];
  }

  /**
   * @description Convert query object to query string
   */
  queryString(query) {
    query = urlUtils.queryToKebabCase(query);
    return urlUtils.queryStringFromObject(query);
  }

  /**
   * @description Create employee allocations
   */
  async createEmployeeAllocations(payload) {
    let timestamp = Date.now();
    try {
      await this.service.createEmployeeAllocations(payload, timestamp);
    } catch(e) {}
    const state = this.store.data.employeeAllocationsCreated[timestamp];
    if ( state && state.state === 'loaded' ) {
      // todo clear cache
    }
    return state;
  }

  /**
   * @description Get filter options for employee allocations
   */
  async getFilters(){
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

const model = new EmployeeAllocationModel();
export default model;
