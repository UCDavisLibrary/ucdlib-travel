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

  async getAccessLevel() {
    let state = this.store.data.accessLevel;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getAccessLevel();
      }
    } catch(e) {}

    return this.store.data.accessLevel;
  }

}

const model = new ReportsModel();
export default model;
