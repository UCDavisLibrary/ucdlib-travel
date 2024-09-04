import {BaseStore} from '@ucd-lib/cork-app-utils';

class ReimbursementRequestStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      created: {},
      fetched: {},
      transactionCreated: {},
      transactionsFetched: {},
      transactionUpdated: {}
    };
    this.events = {
      REIMBURSEMENT_REQUEST_CREATED: 'reimbursement-request-created',
      REIMBURSEMENT_REQUEST_FETCHED: 'reimbursement-request-fetched',
      REIMBURSEMENT_REQUEST_REQUESTED: 'reimbursement-request-requested',
      REIMBURSEMENT_TRANSACTION_CREATED: 'reimbursement-transaction-created',
      REIMBURSEMENT_TRANSACTION_FETCHED: 'reimbursement-transaction-fetched',
      REIMBURSEMENT_TRANSACTION_REQUESTED: 'reimbursement-transaction-requested',
      REIMBURSEMENT_TRANSACTION_UPDATED: 'reimbursement-transaction-updated'
    };

  }

  transactionsFetchedLoading(request, query){
    this._setTransactionsFetchedState({
      state: this.STATE.LOADING,
      request,
      query
    });
  }

  transactionsFetchedLoaded(payload, query){
    this._setTransactionsFetchedState({
      state: this.STATE.LOADED,
      payload,
      query
    });
  }

  transactionsFetchedError(error, query){
    this._setTransactionsFetchedState({
      state: this.STATE.ERROR,
      error,
      query
    });
  }

  _setTransactionsFetchedState(state) {
    this.data.transactionsFetched[state.query] = state;
    this.emit(this.events.REIMBURSEMENT_TRANSACTION_FETCHED, state);
  }

  updatedTransactionLoading(request, timestamp){
    this._setTransactionUpdatedState({
      state: this.STATE.LOADING,
      request,
      timestamp
    });
  }

  updatedTransactionLoaded(payload, timestamp){
    this._setTransactionUpdatedState({
      state: this.STATE.LOADED,
      payload,
      timestamp
    });
  }

  updatedTransactionError(error, timestamp){
    this._setTransactionUpdatedState({
      state: this.STATE.ERROR,
      error,
      timestamp
    });
  }

  _setTransactionUpdatedState(state) {
    this.data.transactionUpdated[state.timestamp] = state;
    this.emit(this.events.REIMBURSEMENT_TRANSACTION_UPDATED, state);
  }

  createdTransactionLoading(request, timestamp){
    this._setTransactionCreatedState({
      state: this.STATE.LOADING,
      request,
      timestamp
    });
  }

  createdTransactionLoaded(payload, timestamp){
    this._setTransactionCreatedState({
      state: this.STATE.LOADED,
      payload,
      timestamp
    });
  }

  createdTransactionError(error, timestamp){
    this._setTransactionCreatedState({
      state: this.STATE.ERROR,
      error,
      timestamp
    });
  }

  _setTransactionCreatedState(state) {
    this.data.transactionCreated[state.timestamp] = state;
    this.emit(this.events.REIMBURSEMENT_TRANSACTION_CREATED, state);
  }

  fetchedLoading(request, query){
    this._setFetchedState({
      state: this.STATE.LOADING,
      request,
      query
    });
  }

  fetchedLoaded(payload, query){
    this._setFetchedState({
      state: this.STATE.LOADED,
      payload,
      query
    });
  }

  fetchedError(error, query){
    this._setFetchedState({
      state: this.STATE.ERROR,
      error,
      query
    });
  }

  _setFetchedState(state) {
    this.data.fetched[state.query] = state;
    this.emit(this.events.REIMBURSEMENT_REQUEST_FETCHED, state);
  }

  createdLoading(request, timestamp){
    this._setCreatedState({
      state: this.STATE.LOADING,
      request,
      timestamp
    });
  }

  createdLoaded(payload, timestamp){
    this._setCreatedState({
      state: this.STATE.LOADED,
      payload,
      timestamp
    });
  }

  createdError(error, timestamp){
    this._setCreatedState({
      state: this.STATE.ERROR,
      error,
      timestamp
    });
  }

  _setCreatedState(state) {
    this.data.created[state.timestamp] = state;
    this.emit(this.events.REIMBURSEMENT_REQUEST_CREATED, state);
  }

}

const store = new ReimbursementRequestStore();
export default store;
