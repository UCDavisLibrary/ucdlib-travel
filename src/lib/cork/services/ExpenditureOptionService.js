import BaseService from "./BaseService.js";
import ExpenditureOptionStore from '../stores/ExpenditureOptionStore.js';
import { appConfig } from '../../appGlobals.js';

class ExpenditureOptionService extends BaseService {

  constructor() {
    super();
    this.store = ExpenditureOptionStore;
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

const service = new ExpenditureOptionService();
export default service;
