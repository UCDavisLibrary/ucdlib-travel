import {BaseModel} from '@ucd-lib/cork-app-utils';
import LineItemService from '../services/LineItemService.js';
import LineItemStore from '../stores/LineItemStore.js';

class LineItemModel extends BaseModel {

  constructor() {
    super();

    this.store = LineItemStore;
    this.service = LineItemService;

    this.register('LineItemModel');
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

const model = new LineItemModel();
export default model;
