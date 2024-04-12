import {BaseModel} from '@ucd-lib/cork-app-utils';
import ReimbursementService from '../services/ReimbursementService.js';
import ReimbursementStore from '../stores/ReimbursementStore.js';

class ReimbursementModel extends BaseModel {

  constructor() {
    super();

    this.store = ReimbursementStore;
    this.service = ReimbursementService;

    this.register('ReimbursementModel');
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

const model = new ReimbursementModel();
export default model;
