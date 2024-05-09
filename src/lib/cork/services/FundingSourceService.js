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

}

const service = new FundingSourceService();
export default service;
