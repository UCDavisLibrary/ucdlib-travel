import BaseService from "./BaseService.js";
import RequestStore from '../stores/RequestStore.js';
import { appConfig } from '../../appGlobals.js';

class RequestService extends BaseService {

  constructor() {
    super();
    this.store = RequestStore;
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

const service = new RequestService();
export default service;
