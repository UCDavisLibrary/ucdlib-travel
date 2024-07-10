import {BaseModel} from '@ucd-lib/cork-app-utils';
import ReimbursementRequestService from '../services/ReimbursementRequestService.js';
import ReimbursementRequestStore from '../stores/ReimbursementRequestStore.js';

class ReimbursementRequestModel extends BaseModel {

  constructor() {
    super();

    this.store = ReimbursementRequestStore;
    this.service = ReimbursementRequestService;

    this.register('ReimbursementRequestModel');
  }

  async create(payload){
    let timestamp = Date.now();
    try {
      await this.service.create(payload, timestamp);
    } catch(e) {}
    const state = this.store.data.created[timestamp];
    if ( state && state.state === 'loaded' ) {
      // todo clear cache
    }
    return state;
  }

}

const model = new ReimbursementRequestModel();
export default model;
