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

 /**
   * @description Query approvers
   * @param {String} args - an object with possible properties
   * id(s) single or array of ids
   * archived - archive approvers
   * active - active approvers
   * 
   */
  async query(args) {
    let state = this.store.data.query[args];;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.query(args);
      }
    } catch(e) {}
    return this.store.data.query[args];
  }

  /**
   * @description Create data of approvers
   * @param {String} data - data to create a new approvers
   */

   create(data) {
    payload = Array.isArray(payload) ? payload : [payload];
    let state = this.store.data.lastUpdate;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.updateSettings(payload);
      }
    } catch(e) {}

    const out = this.store.data.lastUpdate;

    // clear cache for categories that were updated
    // reload categories that were updated and previously loaded
    if ( this.store.data.lastUpdate.state === 'loaded' ) {
      const categories = new Set();
      payload.forEach(setting => {
        (setting.categories || []).forEach(category => {
          categories.add(category);
        });
      });
      categories.forEach(category => {
        const hadCache = this.clearCategoryCache(category);
        if ( hadCache ) {
          this.getByCategory(category);
        }
      });
    }

    return out;
  }

  /**
   * @description Update data of approvers
   * @param {String} data - data to update for approvers
   */
  async update(data) {
    payload = Array.isArray(payload) ? payload : [payload];
    let state = this.store.data.lastUpdate;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.updateSettings(payload);
      }
    } catch(e) {}

    const out = this.store.data.lastUpdate;

    // clear cache for categories that were updated
    // reload categories that were updated and previously loaded
    if ( this.store.data.lastUpdate.state === 'loaded' ) {
      const categories = new Set();
      payload.forEach(setting => {
        (setting.categories || []).forEach(category => {
          categories.add(category);
        });
      });
      categories.forEach(category => {
        const hadCache = this.clearCategoryCache(category);
        if ( hadCache ) {
          this.getByCategory(category);
        }
      });
    }

    return out;
  }


}

const model = new ApproverModel();
export default model;
