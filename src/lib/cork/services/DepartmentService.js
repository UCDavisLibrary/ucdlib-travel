import BaseService from './BaseService.js';
import DepartmentStore from '../stores/DepartmentStore.js';

class DepartmentService extends BaseService {

  constructor() {
    super();
    this.store = DepartmentStore;
  }

  getActiveDepartments(){
    return this.request({
      url : `/api/active-departments`,
      checkCached: () => this.store.data.activeDepartments,
      onLoading : request => this.store.activeDepartmentsLoading(request),
      onLoad : result => this.store.activeDepartmentsLoaded(result.body),
      onError : e => this.store.activeDepartmentsError(e)
    });
  }

}

const service = new DepartmentService();
export default service;
