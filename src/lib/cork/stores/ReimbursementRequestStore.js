import {BaseStore} from '@ucd-lib/cork-app-utils';

class ReimbursementRequestStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      created: {}
    };
    this.events = {
      REIMBURSEMENT_REQUEST_CREATED: 'reimbursement-request-created'
    };

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
