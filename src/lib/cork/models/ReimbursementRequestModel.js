import {BaseModel} from '@ucd-lib/cork-app-utils';
import ReimbursementRequestService from '../services/ReimbursementRequestService.js';
import ReimbursementRequestStore from '../stores/ReimbursementRequestStore.js';

import urlUtils from '../../utils/urlUtils.js';

class ReimbursementRequestModel extends BaseModel {

  constructor() {
    super();

    this.store = ReimbursementRequestStore;
    this.service = ReimbursementRequestService;

    this.register('ReimbursementRequestModel');
    this.inject('ApprovalRequestModel');
  }

  async create(payload){
    let timestamp = Date.now();
    try {
      await this.service.create(payload, timestamp);
    } catch(e) {}
    const state = this.store.data.created[timestamp];
    if ( state && state.state === 'loaded' ) {
      this.store.data.fetched = {};
      this.ApprovalRequestModel.clearCache();
    }
    return state;
  }

  async query(query={}){

    const queryString = urlUtils.queryObjectToKebabString(query);

    let state = this.store.data.fetched[queryString];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.query(queryString);
      }
    } catch(e) {}

    this.store.emit(this.store.events.REIMBURSEMENT_REQUEST_REQUESTED, this.store.data.fetched[queryString]);

    return this.store.data.fetched[queryString];
  }

  async createTransaction(payload){
    let timestamp = Date.now();
    try {
      await this.service.createTransaction(payload, timestamp);
    } catch(e) {}
    const state = this.store.data.transactionCreated[timestamp];
    if ( state && state.state === 'loaded' ) {
      this.store.data.transactionsFetched = {};
    }
    return state;
  }

  async getFundTransactions(reimbursementRequestIds=[]){
    const queryString = urlUtils.queryObjectToKebabString({reimbursementRequestIds});
    let state = this.store.data.transactionsFetched[queryString];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getFundTransactions(queryString);
      }
    } catch(e) {}

    this.store.emit(this.store.events.REIMBURSEMENT_TRANSACTION_REQUESTED, this.store.data.transactionsFetched[queryString]);

    return this.store.data.transactionsFetched[queryString];
  }

}

const model = new ReimbursementRequestModel();
export default model;
