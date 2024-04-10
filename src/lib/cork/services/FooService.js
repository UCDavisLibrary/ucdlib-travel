import BaseService from "./BaseService.js";
import FooStore from '../stores/FooStore.js';
import { appConfig } from '../../appGlobals.js';

class FooService extends BaseService {

  constructor() {
    super();
    this.store = FooStore;
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

const service = new FooService();
export default service;
