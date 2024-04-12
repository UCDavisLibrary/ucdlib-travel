import BaseService from "./BaseService.js";
import ReimbursementStore from '../stores/ReimbursementStore.js';
import { appConfig } from '../../appGlobals.js';

class ReimbursementService extends BaseService {

  constructor() {
    super();
    this.store = ReimbursementStore;
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

const service = new ReimbursementService();
export default service;
