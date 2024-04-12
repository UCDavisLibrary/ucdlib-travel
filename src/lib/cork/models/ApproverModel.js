import {BaseModel} from '@ucd-lib/cork-app-utils';
import ApproverService from '../services/ApproverService.js';
import ApproverStore from '../stores/ApproverStore.js';

class ApproverModel extends BaseModel {

  constructor() {
    super();

    this.store = ApproverStore;
    this.service = ApproverService;

    this.register('ApproverModel');
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

const model = new ApproverModel();
export default model;
