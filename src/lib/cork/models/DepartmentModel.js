import {BaseModel} from '@ucd-lib/cork-app-utils';
import DepartmentService from '../services/DepartmentService.js';
import DepartmentStore from '../stores/DepartmentStore.js';

class DepartmentModel extends BaseModel {

  constructor() {
    super();

    this.store = DepartmentStore;
    this.service = DepartmentService;

    this.register('DepartmentModel');
  }

  async getActiveDepartments(){
    let state = this.store.data.activeDepartments;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getActiveDepartments();
      }
    } catch(e) {}
    return this.store.data.activeDepartments;
  }

}

const model = new DepartmentModel();
export default model;
