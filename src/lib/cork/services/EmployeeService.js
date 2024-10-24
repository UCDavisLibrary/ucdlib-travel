import BaseService from './BaseService.js';
import EmployeeStore from '../stores/EmployeeStore.js';

class EmployeeService extends BaseService {

  constructor() {
    super();
    this.store = EmployeeStore;
  }

  getActiveTitles(){
    return this.request({
      url : `/api/active-titles`,
      checkCached: () => this.store.data.activeTitles,
      onLoading : request => this.store.activeTitlesLoading(request),
      onLoad : result => this.store.activeTitlesLoaded(result.body),
      onError : e => this.store.activeTitlesError(e)
    });
  }

  iamQuery(query){
    return this.request({
      url : `/api/employee${query ? '?' + query : ''}`,
      checkCached: () => this.store.data.iamQuery[query],
      onLoading : request => this.store.iamQueryLoading(request, query),
      onLoad : result => this.store.iamQueryLoaded(result.body, query),
      onError : e => this.store.iamQueryError(e, query)
    });
  }


  iamQueryById(id, idType){
    return this.request({
      url : `/api/employee/${id}?id-type=${idType}`,
      checkCached: () => this.store.data.iamById[this.store.getIamIdKey(id, idType)],
      onLoading : request => this.store.iamQueryByIdLoading(request, id, idType),
      onLoad : result => this.store.iamQueryByIdLoaded(result.body, id, idType),
      onError : e => this.store.iamQueryByIdError(e, id, idType)
    });
  }

  getAllEmployees(){
    return this.request({
      url : `/api/employees`,
      checkCached: () => this.store.data.allEmployees,
      onLoading : request => this.store.allEmployeesLoading(request),
      onLoad : result => this.store.allEmployeesLoaded(result.body),
      onError : e => this.store.allEmployeesError(e)
    });
  }

}

const service = new EmployeeService();
export default service;
