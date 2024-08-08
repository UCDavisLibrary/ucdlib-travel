import BaseService from './BaseService.js';
import NotificationStore from '../stores/NotificationStore.js';

class NotificationService extends BaseService {

  constructor() {
    super();
    this.store = NotificationStore;
  }
  getNotificationHistory(){
    return this.request({
      url : `/api/admin/comments-notification`,
      checkCached: () => this.store.data.notificationHistory,
      onLoading : request => this.store.notificationHistoryLoading(request),
      onLoad : result => this.store.notificationHistoryLoaded(result.body),
      onError : e => this.store.notificationHistoryError(e)
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

  /* TODO: remove method when feature is complete */
  createSystemNotification(payload, timestamp) {
    return this.request({
      url : '/api/admin/system-notification',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.systemNotificationLoading(request, timestamp),
      onLoad : result => this.store.systemNotificationLoaded(result.body, timestamp),
      onError : e => this.store.systemNotificationError(e, timestamp)
    });
  }
}

const service = new NotificationService();
export default service;