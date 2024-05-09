import {BaseStore} from '@ucd-lib/cork-app-utils';

class EmployeeAllocationStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      employeeAllocationsCreated: {},
    };
    this.events = {
      EMPLOYEE_ALLOCATIONS_CREATED: 'employee-allocations-created',
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

}

const store = new EmployeeAllocationStore();
export default store;
