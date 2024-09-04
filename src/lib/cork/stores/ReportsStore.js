import {BaseStore} from '@ucd-lib/cork-app-utils';

class ReportsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      accessLevel: {},
      filters: {}
    };
    this.events = {
      REPORTS_ACCESS_LEVEL_FETCHED: 'reports-access-level-fetched',
      REPORTS_FILTERS_FETCHED: 'reports-filters-fetched'
    };
  }

  filtersLoading(request) {
    this._setFiltersState({
      state : this.STATE.LOADING,
      request
    });
  }

  filtersLoaded(payload) {
    this._setFiltersState({
      state : this.STATE.LOADED,
      payload
    });
  }

  filtersError(error) {
    this._setFiltersState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setFiltersState(state) {
    this.data.filters = state;
    this.emit(this.events.REPORTS_FILTERS_FETCHED, state);
  }

  accessLevelLoading(request) {
    this._setAccessLevelState({
      state : this.STATE.LOADING,
      request
    });
  }

  accessLevelLoaded(payload) {
    this._setAccessLevelState({
      state : this.STATE.LOADED,
      payload
    });
  }

  accessLevelError(error) {
    this._setAccessLevelState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setAccessLevelState(state) {
    this.data.accessLevel = state;
    this.emit(this.events.REPORTS_ACCESS_LEVEL_FETCHED, state);
  }

}

const store = new ReportsStore();
export default store;
