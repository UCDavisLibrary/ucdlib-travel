import BaseService from "./BaseService.js";
import LineItemStore from '../stores/LineItemStore.js';
import { appConfig } from '../../appGlobals.js';

class LineItemService extends BaseService {

  constructor() {
    super();
    this.store = LineItemStore;
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

const service = new LineItemService();
export default service;
