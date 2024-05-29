import {BaseStore} from '@ucd-lib/cork-app-utils';

class AdminApproverTypeStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      query: {},
      create: {},
      update: {}
    };
    this.events = {
      APPROVER_TYPE_QUERY_REQUEST: 'approverType-query-request',
      APPROVER_TYPE_QUERIED: 'approverType-queried',
      APPROVER_TYPE_CREATED: 'approverType-created',
      APPROVER_TYPE_UPDATED: 'approverType-updated'
    };
  }

  queryLoading(request, data) {
    this._setQueryState({
      state : this.STATE.LOADING,
      request
    }, data);
  }

  queryLoaded(payload, data) {
    this._setQueryState({
      state : this.STATE.LOADED,
      payload
    }, data);
  }

  queryError(error, data) {
    this._setQueryState({
      state : this.STATE.ERROR,
      error
    }, data);
  }

  _setQueryState(state, data) {
    this.data.query[data] = state;
    this.emit(this.events.APPROVER_TYPE_QUERIED, state);
  }

  createLoading(request, data) {
    this._setCreateState({
      state : this.STATE.LOADING,
      request
    }, data);
  }

  createLoaded(payload, data) {
    this._setCreateState({
      state : this.STATE.LOADED,
      payload
    }, data);
  }

  createError(error, data) {
    this._setCreateState({
      state : this.STATE.ERROR,
      error
    }, data);
  }

  _setCreateState(state, data) {
    this.data.create = state;
    this.emit(this.events.APPROVER_TYPE_CREATED, state);
  }

  updateLoading(request) {
    this._setUpdateState({
      state : this.STATE.LOADING,
      request
    });
  }

  updateLoaded(payload, id, data) {
    this._setUpdateState({
      state : this.STATE.LOADED,
      payload
    });
  }

  updateError(error, id, data) {
    this._setUpdateState({
      state : this.STATE.ERROR,
      error
    }, data);
  }

  _setUpdateState(state) {
    this.data.update = state;
    this.emit(this.events.APPROVER_TYPE_UPDATED, state);
  }
}

const store = new AdminApproverTypeStore();
export default store;
