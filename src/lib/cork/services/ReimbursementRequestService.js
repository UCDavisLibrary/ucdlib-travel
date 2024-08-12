import BaseService from './BaseService.js';
import ReimbursementRequestStore from '../stores/ReimbursementRequestStore.js';

class ReimbursementRequestService extends BaseService {

  constructor() {
    super();
    this.store = ReimbursementRequestStore;
  }

  create(payload, timestamp) {
    return this.request({
      url : '/api/reimbursement-request',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      onLoading : request => this.store.createdLoading(request, timestamp),
      onLoad : result => this.store.createdLoaded(result.body, timestamp),
      onError : e => this.store.createdError(e, timestamp)
    });
  }

  query(query) {
    return this.request({
      url : `/api/reimbursement-request${query ? '?' + query : ''}`,
      checkCached: () => this.store.data.fetched[query],
      onLoading : request => this.store.fetchedLoading(request, query),
      onLoad : result => this.store.fetchedLoaded(result.body, query),
      onError : e => this.store.fetchedError(e, query)
    });
  }

  createTransaction(payload, timestamp) {
    return this.request({
      url : '/api/reimbursement-transaction',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.createdTransactionLoading(request, timestamp),
      onLoad : result => this.store.createdTransactionLoaded(result.body, timestamp),
      onError : e => this.store.createdTransactionError(e, timestamp)
    });
  }

  getFundTransactions(query) {
    return this.request({
      url : `/api/reimbursement-transaction${query ? '?' + query : ''}`,
      checkCached: () => this.store.data.transactionsFetched[query],
      onLoading : request => this.store.transactionsFetchedLoading(request, query),
      onLoad : result => this.store.transactionsFetchedLoaded(result.body, query),
      onError : e => this.store.transactionsFetchedError(e, query)
    });
  }

}

const service = new ReimbursementRequestService();
export default service;
