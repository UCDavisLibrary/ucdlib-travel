import BaseService from "./BaseService.js";
import AuthStore from '../stores/AuthStore.js';
import { appConfig } from '../../appGlobals.js';
import payload from '../payload.js';

class AuthService extends BaseService {

  constructor() {
    super();
    this.store = AuthStore;
    this.basePath = `${appConfig.apiRoot}/auth`;
  }

  async cacheToken(){
    let ido = {action: 'cache-token'};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.cacheToken,
      () => this.request({
        url : `${this.basePath}/set-cache`,
        checkCached : () => this.store.data.cacheToken.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          this.store.data.cacheToken
        )
      })
    );

    return this.store.data.cacheToken.get(id);
  }

  clearTokenServerCache(){
    return this.request({
      url : `${this.basePath}/clear-cache`,
      onLoading : request => this.store.serverCacheClearedLoading(request),
      onLoad : result => this.store.serverCacheClearedLoaded(result.body),
      onError : e => this.store.serverCacheClearedError(e)
    });
  }

}

const service = new AuthService();
export default service;
