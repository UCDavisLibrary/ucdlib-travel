import {BaseStore} from '@ucd-lib/cork-app-utils';

class ReimbursementRequestStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      created: {},
      fetched: {}
    };
    this.events = {
      REIMBURSEMENT_REQUEST_CREATED: 'reimbursement-request-created',
      REIMBURSEMENT_REQUEST_FETCHED: 'reimbursement-request-fetched',
      REIMBURSEMENT_REQUEST_REQUESTED: 'reimbursement-request-requested'
    };

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
