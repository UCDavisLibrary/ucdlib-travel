import {BaseModel} from '@ucd-lib/cork-app-utils';
import ReportsService from '../services/ReportsService.js';
import ReportsStore from '../stores/ReportsStore.js';

class ReportsModel extends BaseModel {

  constructor() {
    super();

    this.store = ReportsStore;
    this.service = ReportsService;

    this.register('ReportsModel');
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

const model = new ReportsModel();
export default model;
