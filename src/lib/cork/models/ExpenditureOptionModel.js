import {BaseModel} from '@ucd-lib/cork-app-utils';
import ExpenditureOptionService from '../services/ExpenditureOptionService.js';
import ExpenditureOptionStore from '../stores/ExpenditureOptionStore.js';

class ExpenditureOptionModel extends BaseModel {

  constructor() {
    super();

    this.store = ExpenditureOptionStore;
    this.service = ExpenditureOptionService;

    this.register('ExpenditureOptionModel');
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

const model = new ExpenditureOptionModel();
export default model;
