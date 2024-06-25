import {BaseModel} from '@ucd-lib/cork-app-utils';
import FundingSourceService from '../services/FundingSourceService.js';
import FundingSourceStore from '../stores/FundingSourceStore.js';

class FundingSourceModel extends BaseModel {

  constructor() {
    super();

    this.store = FundingSourceStore;
    this.service = FundingSourceService;

    this.register('FundingSourceModel');
  }

  /**
   * @description Get all active (non-archived) funding sources
   */
  async getActiveFundingSources(){
    let state = this.store.data.activeFundingSources;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getActiveFundingSources();
      }
    } catch(e) {}
    this.store.emit(this.store.events.ACTIVE_FUNDING_SOURCES_REQUESTED, this.store.data.activeFundingSources)
    return this.store.data.activeFundingSources;
  }

}

const model = new FundingSourceModel();
export default model;
