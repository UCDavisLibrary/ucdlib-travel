import BaseService from './BaseService.js';
import ApprovalRequestStore from '../stores/ApprovalRequestStore.js';
import payload from '../payload.js';

class ApprovalRequestService extends BaseService {

  constructor() {
    super();
    this.store = ApprovalRequestStore;
    this.basePath = '/api/approval-request';
  }

  async filters(userType) {
    let ido = {userType};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.filters,
      () => this.request({
        url : `${this.basePath}/filters?user-type=${userType}`,
        checkCached: () => this.store.data.filters.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          this.store.data.filters
        )
      })
    );

    return this.store.data.filters.get(id);
  }

  async moreReimbursementToggle(approvalRequestId) {
    let ido = {approvalRequestId};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.moreReimbursementToggle,
      () => this.request({
        url : `${this.basePath}/${approvalRequestId}/toggle-more-reimbursement`,
        fetchOptions : {
          method : 'POST'
        },
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          this.store.data.moreReimbursementToggle
        )
      })
    );

    return this.store.data.moreReimbursementToggle.get(id);
  }

  statusUpdate(approvalRequestId, action) {
    return this.request({
      url : `${this.basePath}/${approvalRequestId}/status-update`,
      fetchOptions : {
        method : 'POST',
        body : action,
      },
      json: true,
      onLoading : request => this.store.statusUpdateLoading(approvalRequestId, action),
      onLoad : result => this.store.statusUpdateLoaded(result.body, approvalRequestId, action),
      onError : e => this.store.statusUpdateError(e, approvalRequestId, action)
    });
  }

  query(query) {
    return this.request({
      url : `${this.basePath}${query ? '?' + query : ''}`,
      checkCached: () => this.store.data.fetched[query],
      onLoading : request => this.store.approvalRequestsFetchedLoading(request, query),
      onLoad : result => this.store.approvalRequestsFetchedLoaded(result.body, query),
      onError : e => this.store.approvalRequestsFetchedError(e, query)
    });
  }

  delete(id, timestamp ){
    return this.request({
      url : `${this.basePath}/${id}`,
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
      url : this.basePath + (forceValidation ? '?force-validation' : ''),
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

  getApprovalChain(approvalRequestId) {
    return this.request({
      url : `${this.basePath}/${approvalRequestId}/approval-chain`,
      checkCached: () => this.store.data.approvalChainByRequestId[approvalRequestId],
      onLoading : request => this.store.approvalChainLoading(request, approvalRequestId),
      onLoad : result => this.store.approvalChainLoaded(result.body, approvalRequestId),
      onError : e => this.store.approvalChainError(e, approvalRequestId)
    });
  }

}

const service = new ApprovalRequestService();
export default service;
