import {BaseModel} from '@ucd-lib/cork-app-utils';
import FundingSourcesService from '../services/FundingSourcesService.js';
import FundingSourcesStore from '../stores/FundingSourcesStore.js';

class FundingSourcesModel extends BaseModel {

  constructor() {
    super();

    this.store = FundingSourcesStore;
    this.service = FundingSourcesService;

    this.register('FundingSourcesModel');
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

const model = new FundingSourcesModel();
export default model;
