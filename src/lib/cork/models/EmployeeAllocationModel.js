import {BaseModel} from '@ucd-lib/cork-app-utils';
import EmployeeAllocationService from '../services/EmployeeAllocationService.js';
import EmployeeAllocationStore from '../stores/EmployeeAllocationStore.js';

class EmployeeAllocationModel extends BaseModel {

  constructor() {
    super();

    this.store = EmployeeAllocationStore;
    this.service = EmployeeAllocationService;

    this.register('EmployeeAllocationModel');
  }

  async createEmployeeAllocations(payload) {
    let timestamp = Date.now();
    try {
      await this.service.createEmployeeAllocations(payload, timestamp);
    } catch(e) {}
    const state = this.store.data.employeeAllocationsCreated[timestamp];
    if ( state && state.state === 'loaded' ) {
      // todo clear cache
    }
    return state;
  }

}

const model = new EmployeeAllocationModel();
export default model;
