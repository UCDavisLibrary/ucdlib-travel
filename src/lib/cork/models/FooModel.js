import {BaseModel} from '@ucd-lib/cork-app-utils';
import FooService from '../services/FooService.js';
import FooStore from '../stores/FooStore.js';

class FooModel extends BaseModel {

  constructor() {
    super();

    this.store = FooStore;
    this.service = FooService;

    this.register('FooModel');
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

const model = new FooModel();
export default model;
