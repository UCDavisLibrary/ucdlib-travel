import {BaseStore} from '@ucd-lib/cork-app-utils';

class ApprovalRequestStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      fetched: {},
      deleted: {},
      created: {},
      approvalChainByRequestId: {}

    };
    this.events = {
      APPROVAL_REQUESTS_FETCHED: 'approval-requests-fetched',
      APPROVAL_REQUESTS_REQUESTED: 'approval-requests-requested',
      APPROVAL_REQUEST_DELETED: 'approval-request-deleted',
      APPROVAL_REQUEST_CREATED: 'approval-request-created',
      APPROVAL_REQUEST_CHAIN_FETCHED: 'approval-request-chain-fetched'
    };
  }

  approvalChainLoading(approvalRequestId) {
    this._setApprovalChainState({
      state : this.STATE.LOADING,
      approvalRequestId
    });
  }

  approvalChainLoaded(payload, approvalRequestId) {
    this._setApprovalChainState({
      state : this.STATE.LOADED,
      payload,
      approvalRequestId
    });
  }

  approvalChainError(error, approvalRequestId) {
    this._setApprovalChainState({
      state : this.STATE.ERROR,
      error,
      approvalRequestId
    });
  }

  _setApprovalChainState(state) {
    this.data.approvalChainByRequestId[state.approvalRequestId] = state;
    this.emit(this.events.APPROVAL_REQUEST_CHAIN_FETCHED, state);
  }

  approvalRequestCreatedLoading(request, timestamp) {
    this._setApprovalRequestCreatedState({
      state : this.STATE.LOADING,
      request,
      timestamp
    });
  }

  approvalRequestCreatedLoaded(payload, timestamp) {
    this._setApprovalRequestCreatedState({
      state : this.STATE.LOADED,
      payload,
      timestamp
    });
  }

  approvalRequestCreatedError(error, timestamp) {
    this._setApprovalRequestCreatedState({
      state : this.STATE.ERROR,
      error,
      timestamp
    });
  }

  _setApprovalRequestCreatedState(state) {
    this.data.created[state.timestamp] = state;
    this.emit(this.events.APPROVAL_REQUEST_CREATED, state);
  }

  approvalRequestDeletedLoading(request, timestamp) {
    this._setApprovalRequestDeletedState({
      state : this.STATE.LOADING,
      request,
      timestamp
    });
  }

  approvalRequestDeletedLoaded(payload, timestamp) {
    this._setApprovalRequestDeletedState({
      state : this.STATE.LOADED,
      payload,
      timestamp
    });
  }

  approvalRequestDeletedError(error, timestamp) {
    this._setApprovalRequestDeletedState({
      state : this.STATE.ERROR,
      error,
      timestamp
    });
  }

  _setApprovalRequestDeletedState(state) {
    this.data.deleted[state.timestamp] = state;
    this.emit(this.events.APPROVAL_REQUEST_DELETED, state);
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
