import BaseService from './BaseService.js';
import EmployeeAllocationStore from '../stores/EmployeeAllocationStore.js';

class EmployeeAllocationService extends BaseService {

  constructor() {
    super();
    this.store = EmployeeAllocationStore;
  }

  query(query) {
    return this.request({
      url : `/api/admin/employee-allocation${query ? '?' + query : ''}`,
      checkCached: () => this.store.data.fetched[query],
      onLoading : request => this.store.employeeAllocationsFetchedLoading(request, query),
      onLoad : result => this.store.employeeAllocationsFetchedLoaded(result.body, query),
      onError : e => this.store.employeeAllocationsFetchedError(e, query)
    });
  }

  createEmployeeAllocations(payload, timestamp) {
    return this.request({
      url : '/api/admin/employee-allocation',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.employeeAllocationsCreatedLoading(request, timestamp),
      onLoad : result => this.store.employeeAllocationsCreatedLoaded(result.body, timestamp),
      onError : e => this.store.employeeAllocationsCreatedError(e, timestamp)
    });
  }

  getFilters() {
    return this.request({
      url : '/api/admin/employee-allocation/filters',
      checkCached : () => this.store.data.filters,
      onLoading : request => this.store.employeeAllocationsFiltersFetchedLoading(request),
      onLoad : result => this.store.employeeAllocationsFiltersFetchedLoaded(result.body),
      onError : e => this.store.employeeAllocationsFiltersFetchedError(e)
    });

  }

}

const service = new EmployeeAllocationService();
export default service;
