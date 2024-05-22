import {BaseModel} from '@ucd-lib/cork-app-utils';
import ApprovalRequestService from '../services/ApprovalRequestService.js';
import ApprovalRequestStore from '../stores/ApprovalRequestStore.js';

import urlUtils from '../../utils/urlUtils.js';

class ApprovalRequestModel extends BaseModel {

  constructor() {
    super();

    this.store = ApprovalRequestStore;
    this.service = ApprovalRequestService;

    this.register('ApprovalRequestModel');
  }

  async query(query={}) {

    const queryString = urlUtils.queryObjectToKebabString(query);

    let state = this.store.data.fetched[queryString];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.query(queryString);
      }
    } catch(e) {}

    this.store.emit(this.store.events.APPROVAL_REQUESTS_REQUESTED, this.store.data.fetched[queryString]);

    return this.store.data.fetched[queryString];

  }

}

const model = new ApprovalRequestModel();
export default model;
