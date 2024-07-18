import {BaseModel} from '@ucd-lib/cork-app-utils';
import NotificationService from '../services/NotificationService.js';
import NotificationStore from '../stores/NotificationStore.js';

class NotificationModel extends BaseModel {

  constructor() {
    super();

    this.store = NotificationStore;
    this.service = NotificationService;
      
    this.register('NotificationModel');
  }

    /**
   * @description Get all history for the approval request
   */
     async getNotificationHistory(){
      let state = this.store.data.notificationHistory;
      try {
        if( state && state.state === 'loading' ) {
          await state.request;
        } else {
          await this.service.getNotificationHistory();
        }
      } catch(e) {}
      return this.store.data.notificationHistory;
    }
  
    /**
     * @description Create a new comment and questions for approval request
     * @param {Object} payload - comment information - see db-models/email/controller.js
     */
    async createNotificationComments(payload) {
      let timestamp = Date.now();

      try {
        await this.service.createNotificationComments(payload, timestamp);
      } catch(e) {}
      const state = this.store.data.notificationComments[timestamp];
      if ( state && state.state === 'loaded' ) {
        this.store.data.notificationComments = {};
      }
      return state;
    }

}

const model = new NotificationModel();
export default model;