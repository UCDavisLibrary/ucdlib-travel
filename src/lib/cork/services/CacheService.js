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
      checkCached: () => this.store.data.searchCache,
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
      checkCached: () => this.store.data.deleteCache[q],
      onLoading : request => this.store.deleteCacheLoading(request, q),
      onLoad : result => this.store.deleteCacheLoaded(result.body, q),
      onError : e => this.store.deleteCacheError(e, q)
    });
  }

  async getCount(){
    const url = `/api/admin/cache/count`;

    return this.request({
      url: url,
      checkCached: () => this.store.data.getCount,
      onLoading : request => this.store.getCountCacheLoading(request),
      onLoad : result => this.store.getCountCacheLoaded(result.body),
      onError : e => this.store.getCountCacheError(e)
    });
  }

}

const service = new CacheService();
export default service;