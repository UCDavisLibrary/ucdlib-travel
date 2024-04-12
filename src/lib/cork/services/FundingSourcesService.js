import BaseService from "./BaseService.js";
import FundingSourcesStore from '../stores/FundingSourcesStore.js';
import { appConfig } from '../../appGlobals.js';

class FundingSourcesService extends BaseService {

  constructor() {
    super();
    this.store = FundingSourcesStore;
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

const service = new FundingSourcesService();
export default service;
