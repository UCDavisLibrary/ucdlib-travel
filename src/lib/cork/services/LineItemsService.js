import BaseService from './BaseService.js';
import LineItemsStore from '../stores/LineItemsStore.js';

class LineItemsService extends BaseService {

  constructor() {
    super();
    this.store = LineItemsStore;
  }

  getActiveLineItems(){
    return this.request({
      url : `/api/admin/line-items`,
      checkCached: () => this.store.data.activeLineItems,
      onLoading : request => this.store.activeLineItemsLoading(request),
      onLoad : result => this.store.activeLineItemsLoaded(result.body),
      onError : e => this.store.activeLineItemsError(e)
    });
  }

  createLineItem(payload, timestamp) {
    return this.request({
      url : '/api/admin/line-items',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.lineItemsCreatedLoading(request, timestamp),
      onLoad : result => this.store.lineItemsCreatedLoaded(result.body, timestamp),
      onError : e => this.store.lineItemsCreatedError(e, timestamp)
    });
  }

  updateLineItem(payload, timestamp) {
    return this.request({
      url : `/api/admin/line-items`,
      fetchOptions : {
        method : 'PUT',
        body : payload
      },
      json: true,
      onLoading : request => this.store.lineItemsUpdatedLoading(request, timestamp),
      onLoad : result => this.store.lineItemsUpdatedLoaded(result.body, timestamp),
      onError : e => this.store.lineItemsUpdatedError(e, timestamp, payload)
    });
  }

}

const service = new LineItemsService();
export default service;
