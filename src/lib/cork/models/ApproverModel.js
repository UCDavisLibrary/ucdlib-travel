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
   * @description Get settings by category
   * @param {String} category - slug of category to get settings for
   * can be found in 'categories' column of settings table
   */
  async getByCategory(category) {
    let state = this.store.data.byCategory[category];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getByCategory(category);
      }
    } catch(e) {}
    return this.store.data.byCategory[category];
  }

  /**
   * @description Get a settings value by key from the settings store
   * It must have aleady been fetched as part of a getByCategory call
   * @param {String} key - key of setting to get
   * @param {String} defaultValue - default value to return if setting does not exist
   * @returns {String} setting value or default value if setting does not exist
   */
  getByKey(key, defaultValue=''){
    for( let category in this.store.data.byCategory ) {
      let settings = this.store.data.byCategory[category].payload;
      if( settings && Array.isArray(settings) ) {
        for( let setting of settings ) {
          if( setting.key === key ) {
            return setting.useDefaultValue ? setting.defaultValue : setting.value;
          }
        }
      }
    }
    return defaultValue;

  }

  /**
   * @description Clear browser cache for all categories or a specific category
   * @param {String} category - category to clear cache for, if not provided all categories will be cleared
   * @returns {Boolean} true if cache was cleared, false if category cache did not exist
   */
  clearCategoryCache(category) {
    if ( !category ) {
      this.store.data.byCategory = {};
      return true;
    }
    if ( this.store.data.byCategory[category] ) {
      delete this.store.data.byCategory[category];
      return true;
    }
    return false;
  }

  /**
   * @description Update settings
   * @param {Array} payload - array of settings objects to update
   */
  async updateSettings(payload) {
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
