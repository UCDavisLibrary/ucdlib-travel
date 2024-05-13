import {BaseStore} from '@ucd-lib/cork-app-utils';

class EmployeeAllocationStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      employeeAllocationsCreated: {},
      filters: {}
    };
    this.events = {
      EMPLOYEE_ALLOCATIONS_CREATED: 'employee-allocations-created',
      EMPLOYEE_ALLOCATIONS_FILTERS_FETCHED: 'employee-allocations-filters-fetched'
    };
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
