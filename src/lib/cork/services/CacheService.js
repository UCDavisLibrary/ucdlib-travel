import BaseService from './BaseService.js';
import CacheStore from '../stores/CacheStore.js';

class CacheService extends BaseService {

  constructor() {
    super();
    this.store = CacheStore;
  }

  async searchCache(q){
    const params = new URLSearchParams();

    if (q.type) params.append('type', q.type);

    if (q.query) params.append('query', q.query);
  
    const queryString = params.toString();

    const url = `/api/admin/cache${queryString ? '?' + queryString : ''}`;

    return this.request({
      url: url,
      onLoading : request => this.store.searchCacheLoading(request, q),
      onLoad : result => this.store.searchCacheLoaded(result.body, q),
      onError : e => this.store.searchCacheError(e, q)
    });
  }

  async deleteCache(q){
    return this.request({
      url: `/api/admin/cache`,
      fetchOptions : {
        method : 'DELETE',
        body : q
      },
      json: true,
      onLoading : request => this.store.deleteCacheLoading(request, q),
      onLoad : result => this.store.deleteCacheLoaded(result.body, q),
      onError : e => this.store.deleteCacheError(e, q)
    });
  }

  async getCacheCount(){
    const url = `/api/admin/cache/count`;

    return this.request({
      url: url,
      onLoading : request => this.store.getCacheCountCacheLoading(request),
      onLoad : result => this.store.getCacheCountCacheLoaded(result.body),
      onError : e => this.store.getCacheCountCacheError(e)
    });
  }

}

const service = new CacheService();
export default service;