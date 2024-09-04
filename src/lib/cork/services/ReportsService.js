import BaseService from './BaseService.js';
import ReportsStore from '../stores/ReportsStore.js';

class ReportsService extends BaseService {

  constructor() {
    super();
    this.store = ReportsStore;
  }

  getAccessLevel() {
    return this.request({
      url : '/api/reports/access-level',
      checkCached: () => this.store.data.accessLevel,
      onLoading : request => this.store.accessLevelLoading(request),
      onLoad : result => this.store.accessLevelLoaded(result.body),
      onError : e => this.store.accessLevelError(e)
    });
  }

}

const service = new ReportsService();
export default service;
