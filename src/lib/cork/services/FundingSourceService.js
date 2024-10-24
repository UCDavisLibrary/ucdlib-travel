import BaseService from './BaseService.js';
import FundingSourceStore from '../stores/FundingSourceStore.js';

class FundingSourceService extends BaseService {

  constructor() {
    super();
    this.store = FundingSourceStore;
  }

  getActiveFundingSources(){
    return this.request({
      url : `/api/admin/funding-source`,
      checkCached: () => this.store.data.activeFundingSources,
      onLoading : request => this.store.activeFundingSourcesLoading(request),
      onLoad : result => this.store.activeFundingSourcesLoaded(result.body),
      onError : e => this.store.activeFundingSourcesError(e)
    });
  }

  update(payload, timestamp) {
    return this.request({
      url : `/api/admin/funding-source`,
      fetchOptions : {
        method : 'PUT',
        body : payload
      },
      json: true,
      onLoading : request => this.store.updatedLoading(request, payload, timestamp),
      onLoad : result => this.store.updatedLoaded(result.body, payload, timestamp),
      onError : e => this.store.updatedError(e, payload, timestamp)
    });
  }

  create(payload, timestamp) {
    return this.request({
      url : `/api/admin/funding-source`,
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.createdLoading(request, payload, timestamp),
      onLoad : result => this.store.createdLoaded(result.body, payload, timestamp),
      onError : e => this.store.createdError(e, payload, timestamp)
    });
  }

}

const service = new FundingSourceService();
export default service;
