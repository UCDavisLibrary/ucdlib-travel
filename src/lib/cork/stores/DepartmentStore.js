import {BaseStore} from '@ucd-lib/cork-app-utils';

class DepartmentStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      activeDepartments: {},
      localByQuery: {}
    };
    this.events = {
      ACTIVE_DEPARTMENTS_FETCHED: 'active-departments-fetched',
      DEPARTMENTS_FETCHED: 'departments-fetched',
      DEPARTMENTS_REQUESTED: 'departments-requested'
    };
  }

  localQueryLoading(request, query) {
    this._setLocalQueryState( {
      state : this.STATE.LOADING,
      request,
      query
    });
  }

  localQueryLoaded(payload, query) {
    this._setLocalQueryState( {
      state : this.STATE.LOADED,
      payload,
      query
    });
  }

  localQueryError(error, query) {
    this._setLocalQueryState( {
      state : this.STATE.ERROR,
      error,
      query
    });
  }

  _setLocalQueryState(state) {
    this.data.localByQuery[state.query] = state;
    this.emit(this.events.DEPARTMENTS_FETCHED, state);
  }

  activeDepartmentsLoading(request) {
    this._setActiveDepartmentsState({
      state : this.STATE.LOADING,
      request
    });
  }

  activeDepartmentsLoaded(payload) {
    this._setActiveDepartmentsState({
      state : this.STATE.LOADED,
      payload
    });
  }

  activeDepartmentsError(error) {
    this._setActiveDepartmentsState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setActiveDepartmentsState(state) {
    this.data.activeDepartments = state;
    this.emit(this.events.ACTIVE_DEPARTMENTS_FETCHED, state);
  }

}

const store = new DepartmentStore();
export default store;
