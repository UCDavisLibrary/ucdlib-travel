import {BaseStore} from '@ucd-lib/cork-app-utils';

class DepartmentStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      activeDepartments: {}
    };
    this.events = {
      ACTIVE_DEPARTMENTS_FETCHED: 'active-departments-fetched'
    };
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
