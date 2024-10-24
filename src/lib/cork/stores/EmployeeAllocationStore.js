import {BaseStore} from '@ucd-lib/cork-app-utils';

class EmployeeAllocationStore extends BaseStore {

  constructor() {
    super();

    this.clearCache();

    this.events = {
      EMPLOYEE_ALLOCATIONS_CREATED: 'employee-allocations-created',
      EMPLOYEE_ALLOCATIONS_FILTERS_FETCHED: 'employee-allocations-filters-fetched',
      EMPLOYEE_ALLOCATIONS_FETCHED: 'employee-allocations-fetched',
      EMPLOYEE_ALLOCATIONS_REQUESTED: 'employee-allocations-requested',
      EMPLOYEE_ALLOCATIONS_DELETED: 'employee-allocations-deleted',
      EMPLOYEE_ALLOCATIONS_UPDATED: 'employee-allocations-updated',
      USER_ALLOCATIONS_SUMMARY_FETCHED: 'user-allocations-summary-fetched',
      USER_ALLOCATIONS_SUMMARY_REQUESTED: 'user-allocations-summary-requested'
    };
  }

  clearCache(){
    this.data = {
      employeeAllocationsCreated: {},
      filters: {},
      fetched: {},
      deleted: {},
      userSummary: {},
      updated: {}
    };
  }

  updatedLoading(request, timestamp, data) {
    this._setUpdatedState({
      state : this.STATE.LOADING,
      request,
      timestamp,
      data
    });
  }

  updatedLoaded(payload, timestamp, data) {
    this._setUpdatedState({
      state : this.STATE.LOADED,
      payload,
      timestamp,
      data
    });
  }

  updatedError(error, timestamp, data) {
    this._setUpdatedState({
      state : this.STATE.ERROR,
      error,
      timestamp,
      data
    });
  }

  _setUpdatedState(state) {
    this.data.updated[state.timestamp] = state;
    this.emit(this.events.EMPLOYEE_ALLOCATIONS_UPDATED, state);
  }


  userAllocationsSummaryRequestedLoading(request, query) {
    this._setUserAllocationsSummaryRequestedState({
      state : this.STATE.LOADING,
      request,
      query
    });
  }

  userAllocationsSummaryRequestedLoaded(payload, query) {
    this._setUserAllocationsSummaryRequestedState({
      state : this.STATE.LOADED,
      payload,
      query
    });
  }

  userAllocationsSummaryRequestedError(error, query) {
    this._setUserAllocationsSummaryRequestedState({
      state : this.STATE.ERROR,
      error,
      query
    });
  }

  _setUserAllocationsSummaryRequestedState(state) {
    this.data.userSummary[state.query] = state;
    this.emit(this.events.USER_ALLOCATIONS_SUMMARY_REQUESTED, state);
  }

  employeeAllocationsDeletedLoading(request, timestamp) {
    this._setEmployeeAllocationsDeletedState({
      state : this.STATE.LOADING,
      request,
      timestamp
    });
  }

  employeeAllocationsDeletedLoaded(payload, timestamp) {
    this._setEmployeeAllocationsDeletedState({
      state : this.STATE.LOADED,
      payload,
      timestamp
    });
  }

  employeeAllocationsDeletedError(error, timestamp) {
    this._setEmployeeAllocationsDeletedState({
      state : this.STATE.ERROR,
      error,
      timestamp
    });
  }

  _setEmployeeAllocationsDeletedState(state) {
    this.data.deleted[state.timestamp] = state;
    this.emit(this.events.EMPLOYEE_ALLOCATIONS_DELETED, state);
  }

  employeeAllocationsFetchedLoading(request, query) {
    this._setEmployeeAllocationsFetchedState({
      state : this.STATE.LOADING,
      request,
      query
    });
  }

  employeeAllocationsFetchedLoaded(payload, query) {
    this._setEmployeeAllocationsFetchedState({
      state : this.STATE.LOADED,
      payload,
      query
    });
  }

  employeeAllocationsFetchedError(error, query) {
    this._setEmployeeAllocationsFetchedState({
      state : this.STATE.ERROR,
      error,
      query
    });
  }

  _setEmployeeAllocationsFetchedState(state) {
    this.data.fetched[state.query] = state;
    this.emit(this.events.EMPLOYEE_ALLOCATIONS_FETCHED, state);
  }

  employeeAllocationsCreatedLoading(request, timestamp) {
    this._setEmployeeAllocationsCreatedState({
      state : this.STATE.LOADING,
      request,
      timestamp
    });
  }

  employeeAllocationsCreatedLoaded(payload, timestamp) {
    this._setEmployeeAllocationsCreatedState({
      state : this.STATE.LOADED,
      payload,
      timestamp
    });
  }

  employeeAllocationsCreatedError(error, timestamp) {
    this._setEmployeeAllocationsCreatedState({
      state : this.STATE.ERROR,
      error,
      timestamp
    });
  }

  _setEmployeeAllocationsCreatedState(state) {
    this.data.employeeAllocationsCreated[state.timestamp] = state;
    this.emit(this.events.EMPLOYEE_ALLOCATIONS_CREATED, state);
  }

  employeeAllocationsFiltersFetchedLoading(request) {
    this._setEmployeeAllocationsFiltersFetchedState({
      state : this.STATE.LOADING,
      request
    });
  }

  employeeAllocationsFiltersFetchedLoaded(payload) {
    this._setEmployeeAllocationsFiltersFetchedState({
      state : this.STATE.LOADED,
      payload
    });
  }

  employeeAllocationsFiltersFetchedError(error) {
    this._setEmployeeAllocationsFiltersFetchedState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setEmployeeAllocationsFiltersFetchedState(state) {
    this.data.filters = state;
    this.emit(this.events.EMPLOYEE_ALLOCATIONS_FILTERS_FETCHED, state);
  }

}

const store = new EmployeeAllocationStore();
export default store;
