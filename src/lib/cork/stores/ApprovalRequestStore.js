import {BaseStore} from '@ucd-lib/cork-app-utils';

class ApprovalRequestStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      fetched: {},
    };
    this.events = {
      APPROVAL_REQUESTS_FETCHED: 'approval-requests-fetched',
      APPROVAL_REQUESTS_REQUESTED: 'approval-requests-requested'
    };
  }

  approvalRequestsFetchedLoading(query) {
    this._setApprovalRequestsFetchedState({
      state : this.STATE.LOADING,
      query
    });
  }

  approvalRequestsFetchedLoaded(payload, query) {
    this._setApprovalRequestsFetchedState({
      state : this.STATE.LOADED,
      payload,
      query
    });
  }

  approvalRequestsFetchedError(error, query) {
    this._setApprovalRequestsFetchedState({
      state : this.STATE.ERROR,
      error,
      query
    });
  }

  _setApprovalRequestsFetchedState(state) {
    this.data.fetched[state.query] = state;
    this.emit(this.events.APPROVAL_REQUESTS_FETCHED, state);
  }

}

const store = new ApprovalRequestStore();
export default store;
