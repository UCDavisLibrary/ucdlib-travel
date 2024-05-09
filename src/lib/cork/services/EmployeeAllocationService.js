import BaseService from './BaseService.js';
import EmployeeAllocationStore from '../stores/EmployeeAllocationStore.js';

class EmployeeAllocationService extends BaseService {

  constructor() {
    super();
    this.store = EmployeeAllocationStore;
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

}

const service = new EmployeeAllocationService();
export default service;
