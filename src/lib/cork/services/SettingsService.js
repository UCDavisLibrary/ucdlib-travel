import BaseService from "./BaseService.js";
import SettingsStore from '../stores/SettingsStore.js';
import { appConfig } from '../../appGlobals.js';

class SettingsService extends BaseService {

  constructor() {
    super();
    this.store = SettingsStore;
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

const service = new SettingsService();
export default service;
