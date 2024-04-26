import BaseService from './BaseService.js';
import SettingsStore from '../stores/SettingsStore.js';

class SettingsService extends BaseService {

  constructor() {
    super();
    this.store = SettingsStore;
  }

  getByCategory(category){
    return this.request({
      url : `/api/admin/settings/category/${category}`,
      checkCached: () => this.store.data.byCategory[category],
      onLoading : request => this.store.byCategoryLoading(request, category),
      onLoad : result => this.store.byCategoryLoaded(result.body, category),
      onError : e => this.store.byCategoryError(e, category)
    });
  }

  updateSettings(payload) {
    return this.request({
      url : '/api/admin/settings',
      fetchOptions : {
        method : 'PUT',
        body : payload
      },
      json: true,
      onLoading : request => this.store.updateLoading(request),
      onLoad : result => this.store.updateLoaded(result.body),
      onError : e => this.store.updateError(e)
    });

  }

}

const service = new SettingsService();
export default service;
