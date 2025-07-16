import {BaseModel} from '@ucd-lib/cork-app-utils';
import CacheService from '../services/CacheService.js';
import CacheStore from '../stores/CacheStore.js';

class CacheModel extends BaseModel {

  constructor() {
    super();

    this.store = CacheStore;
    this.service = CacheService;
      
    this.register('CacheModel');
  }

  async searchCache(q){
    try {
      await this.service.searchCache(q);
    } catch(e) {}
    const state = this.store.data.searchCache;

    if ( state && state.state === 'loaded' ) {
      this.store.data.searchCache = {};
    }

    return state;
  }


  async deleteCache(q){
    try {
      await this.service.deleteCache(q);
    } catch(e) {}
    const state = this.store.data.deleteCache;

    if ( state && state.state === 'loaded' ) {
      this.store.data.deleteCache = {};
    }

    return state;
  }

  async getCount(){
    try {
      await this.service.getCount();
    } catch(e) {}
    const state = this.store.data.getCount;

    if ( state && state.state === 'loaded' ) {
      this.store.data.getCount = {};
    }

    return state;
  }

}

const model = new CacheModel();
export default model;