import {BaseModel} from '@ucd-lib/cork-app-utils';
import DepartmentService from '../services/DepartmentService.js';
import DepartmentStore from '../stores/DepartmentStore.js';

import urlUtils from '../../utils/urlUtils.js';

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

  async queryLocal(query={}){
    const queryString = '?' + urlUtils.queryObjectToKebabString(query);

    let state = this.store.data.localByQuery[queryString];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.queryLocal(queryString);
      }
    } catch(e) {}

    this.store.emit(this.store.events.DEPARTMENTS_REQUESTED, this.store.data.localByQuery[queryString]);

    return this.store.data.localByQuery[queryString];
  }

}

const model = new DepartmentModel();
export default model;
