import {BaseModel} from '@ucd-lib/cork-app-utils';
import SettingsService from '../services/SettingsService.js';
import SettingsStore from '../stores/SettingsStore.js';

class SettingsModel extends BaseModel {

  constructor() {
    super();

    this.store = SettingsStore;
    this.service = SettingsService;

    this.register('SettingsModel');
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

const model = new SettingsModel();
export default model;
