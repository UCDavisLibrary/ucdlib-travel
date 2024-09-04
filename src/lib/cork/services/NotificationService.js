import BaseService from './BaseService.js';
import NotificationStore from '../stores/NotificationStore.js';

class NotificationService extends BaseService {

  constructor() {
    super();
    this.store = NotificationStore;
  }
  getNotificationHistory(query){
    return this.request({
      url : `/api/admin/comments-notification${query ? '?' + query : ''}`,
      checkCached: () => this.store.data.notificationHistory[query],
      onLoading : request => this.store.notificationHistoryLoading(request, query),
      onLoad : result => this.store.notificationHistoryLoaded(result.body, query),
      onError : e => this.store.notificationHistoryError(e, query)
    });
  }

  createNotificationComments(payload, timestamp) {
    return this.request({
      url : '/api/admin/comments-notification',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.notificationCommentsLoading(request, timestamp),
      onLoad : result => this.store.notificationCommentsLoaded(result.body, timestamp),
      onError : e => this.store.notificationCommentsError(e, timestamp)
    });
  }
}

const service = new NotificationService();
export default service;