import {BaseStore} from '@ucd-lib/cork-app-utils';

class ReportsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      accessLevel: {},
      filters: {},
      reports: {}
    };
    this.events = {
      REPORTS_ACCESS_LEVEL_FETCHED: 'reports-access-level-fetched',
      REPORTS_FILTERS_FETCHED: 'reports-filters-fetched',
      REPORT_FETCHED: 'report-fetched',
      REPORT_REQUESTED: 'report-requested'
    };
  }

  reportLoading(request, query) {
    this._setReportState({
      state : this.STATE.LOADING,
      request,
      query
    });
  }

  reportLoaded(payload, query) {
    this._setReportState({
      state : this.STATE.LOADED,
      payload,
      query
    });
  }

  reportError(error, query) {
    this._setReportState({
      state : this.STATE.ERROR,
      error,
      query
    });
  }

  _setReportState(state) {
    this.data.reports[state.query] = state;
    this.emit(this.events.REPORT_FETCHED, state);
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
