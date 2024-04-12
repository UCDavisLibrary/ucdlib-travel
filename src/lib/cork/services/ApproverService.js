import BaseService from "./BaseService.js";
import ApproverStore from '../stores/ApproverStore.js';
import { appConfig } from '../../appGlobals.js';

class ApproverService extends BaseService {

  constructor() {
    super();
    this.store = ApproverStore;
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

const service = new ApproverService();
export default service;
