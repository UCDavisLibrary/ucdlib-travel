import {BaseModel} from '@ucd-lib/cork-app-utils';
import RequestService from '../services/RequestService.js';
import RequestStore from '../stores/RequestStore.js';

class RequestModel extends BaseModel {

  constructor() {
    super();

    this.store = RequestStore;
    this.service = RequestService;

    this.register('RequestModel');
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

const model = new RequestModel();
export default model;
