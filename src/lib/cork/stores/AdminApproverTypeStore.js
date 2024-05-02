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
      APPROVERTYPE_QUERIED: 'approverType-queried',
      APPROVERTYPE_CREATED: 'approverType-created',
      APPROVERTYPE_UPDATED: 'approverType-updated'
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
    this.emit(this.events.APPROVERTYPE_QUERIED, state);
  }


///YOU ARE HERE
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
    this.data.create[data] = state;
    this.emit(this.events.APPROVERTYPE_CREATED, state);
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
    });
  }

  _setUpdateState(state) {
    this.data.update = state;
    this.emit(this.events.APPROVERTYPE_UPDATED, state);
  }
}

const store = new AdminApproverTypeStore();
export default store;
