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

    return state;
  }


  async deleteCache(q){
    try {
      await this.service.deleteCache(q);
    } catch(e) {}
    const state = this.store.data.deleteCache;

    return state;
  }

  async getCacheCount(){
    try {
      await this.service.getCacheCount();
    } catch(e) {}
    const state = this.store.data.getCacheCount;

    return state;
  }

}

const model = new CacheModel();
export default model;