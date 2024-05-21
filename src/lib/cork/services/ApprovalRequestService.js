import BaseService from './BaseService.js';
import ApprovalRequestStore from '../stores/ApprovalRequestStore.js';

class ApprovalRequestService extends BaseService {

  constructor() {
    super();
    this.store = ApprovalRequestStore;
  }

  query(query) {
    return this.request({
      url : `/api/approval-request${query ? '?' + query : ''}`,
      checkCached: () => this.store.data.fetched[query],
      onLoading : request => this.store.approvalRequestsFetchedLoading(request, query),
      onLoad : result => this.store.approvalRequestsFetchedLoaded(result.body, query),
      onError : e => this.store.approvalRequestsFetchedError(e, query)
    });
  }

}

const service = new ApprovalRequestService();
export default service;
