import BaseService from "./BaseService.js";
import EmployeeStore from '../stores/EmployeeStore.js';
import { appConfig } from '../../appGlobals.js';

class EmployeeService extends BaseService {

  constructor() {
    super();
    this.store = EmployeeStore;
  }

  getFoo(){
    return this.request({
      url : `${appConfig.apiRoot}/foo`,
      onLoading : request => this.store.getFooLoading(request),
      checkCached : () => this.store.data.foo,
      onLoad : result => this.store.getFooLoaded(result.body),
      onError : e => this.store.getFooError(e)
    });
  }

}

const service = new EmployeeService();
export default service;
