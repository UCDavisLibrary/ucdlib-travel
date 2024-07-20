import {BaseStore} from '@ucd-lib/cork-app-utils';

class NotificationStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      notificationHistory: {},
      notificationComments: {},
      notificationSystems: {}
    };
    this.events = {
      NOTIFICATION_HISTORY: 'notification-history',
      NOTIFICATION_COMMENTS: 'notification-comments',
      NOTIFICATION_SYSTEMS: 'notification-systems',

    };
  }

  notificationHistoryLoading(request) {
    this._setNotificationHistoryState({
      state : this.STATE.LOADING,
      request
    });
  }
  notificationHistoryLoaded(payload) {
    this._setNotificationHistoryState({
      state : this.STATE.LOADED,
      payload
    });
  }
  notificationHistoryError(error) {
    this._setNotificationHistoryState({
      state : this.STATE.ERROR,
      error
    });
  }
  _setNotificationHistoryState(state) {
    this.data.notificationHistory = state;
    this.emit(this.events.NOTIFICATION_HISTORY, state);
  }

  notificationCommentsLoading(request, timestamp) {
    this._setNotificationCommentsState({
      state : this.STATE.LOADING,
      request
    }, timestamp);
  }
  notificationCommentsLoaded(payload, timestamp) {
    this._setNotificationCommentsState({
      state : this.STATE.LOADED,
      payload
    }, timestamp);
  }
  notificationCommentsError(error, timestamp) {
    this._setNotificationCommentsState({
      state : this.STATE.ERROR,
      error
    }, timestamp);
  }
  _setNotificationCommentsState(state, timestamp) {
    this.data.notificationComments[timestamp] = state;
    this.emit(this.events.NOTIFICATION_COMMENTS, state);
  }

  systemNotificationLoading(request, timestamp) {
    this._setSystemNotificationState({
      state : this.STATE.LOADING,
      request
    }, timestamp);
  }
  systemNotificationLoaded(payload, timestamp) {
    this._setSystemNotificationState({
      state : this.STATE.LOADED,
      payload
    }, timestamp);
  }
  systemNotificationError(error, timestamp) {
    this._setSystemNotificationState({
      state : this.STATE.ERROR,
      error
    }, timestamp);
  }
  _setSystemNotificationState(state, timestamp) {
    this.data.notificationSystems[timestamp] = state;
    this.emit(this.events.NOTIFICATION_SYSTEMS, state);
  }

}

const store = new NotificationStore();
export default store;