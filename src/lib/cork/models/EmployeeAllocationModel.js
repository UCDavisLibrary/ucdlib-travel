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

  async getFoo(){
    let state = this.store.data.foo;
    try {
      if ( state.state === 'loading' ){
        await state.request
      } else {
        await this.service.getFoo();
      }
    } catch(e) {}
    return this.store.data.foo;
  }

}

const model = new EmployeeAllocationModel();
export default model;
