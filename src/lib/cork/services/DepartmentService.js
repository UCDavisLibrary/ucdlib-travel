import BaseService from './BaseService.js';
import DepartmentStore from '../stores/DepartmentStore.js';

class DepartmentService extends BaseService {

  constructor() {
    super();
    this.store = DepartmentStore;
  }

  queryLocal(query){
    return this.request({
      url: `/api/department${query}`,
      checkCached: () => this.store.data.localByQuery[query],
      onLoading : request => this.store.localQueryLoading(request, query),
      onLoad : result => this.store.localQueryLoaded(result.body, query),
      onError : e => this.store.localQueryError(e, query)
    });
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
