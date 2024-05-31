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

  delete(id, timestamp ){
    return this.request({
      url : `/api/approval-request/${id}`,
      fetchOptions : {
        method : 'DELETE'
      },
      onLoading : request => this.store.approvalRequestDeletedLoading(request, timestamp),
      onLoad : result => this.store.approvalRequestDeletedLoaded(result.body, timestamp),
      onError : e => this.store.approvalRequestDeletedError(e, timestamp)
    });
  }

  create(payload, timestamp, forceValidation) {
    return this.request({
      url : '/api/approval-request' + (forceValidation ? '?force-validation' : ''),
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.approvalRequestCreatedLoading(request, timestamp),
      onLoad : result => this.store.approvalRequestCreatedLoaded(result.body, timestamp),
      onError : e => this.store.approvalRequestCreatedError(e, timestamp)
    });
  }

}

const service = new ApprovalRequestService();
export default service;
