import BaseService from './BaseService.js';
import EmployeeAllocationStore from '../stores/EmployeeAllocationStore.js';

class EmployeeAllocationService extends BaseService {

  constructor() {
    super();
    this.store = EmployeeAllocationStore;
  }

  userSummary(query) {
    return this.request({
      url : `/api/admin/employee-allocation/user-summary${query ? '?' + query : ''}`,
      checkCached: () => this.store.data.userSummary[query],
      onLoading : request => this.store.userAllocationsSummaryRequestedLoading(request, query),
      onLoad : result => this.store.userAllocationsSummaryRequestedLoaded(result.body, query),
      onError : e => this.store.userAllocationsSummaryRequestedError(e, query)
    });
  }

  delete(payload, timestamp) {
    return this.request({
      url : '/api/admin/employee-allocation',
      fetchOptions : {
        method : 'DELETE',
        body : payload
      },
      json: true,
      onLoading : request => this.store.employeeAllocationsDeletedLoading(request, timestamp),
      onLoad : result => this.store.employeeAllocationsDeletedLoaded(result.body, timestamp),
      onError : e => this.store.employeeAllocationsDeletedError(e, timestamp)
    });
  }

  update(payload, timestamp) {
    return this.request({
      url : '/api/admin/employee-allocation',
      fetchOptions : {
        method : 'PUT',
        body : payload
      },
      json: true,
      onLoading : request => this.store.updatedLoading(request, timestamp, payload),
      onLoad : result => this.store.updatedLoaded(result.body, timestamp, payload),
      onError : e => this.store.updatedError(e, timestamp, payload)
    });
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

  createEmployeeAllocations(payload, allowDuplicateAllocations, timestamp) {
    return this.request({
      url : `/api/admin/employee-allocation${allowDuplicateAllocations ? '?allow-duplicate-allocations=true' : ''}`,
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
