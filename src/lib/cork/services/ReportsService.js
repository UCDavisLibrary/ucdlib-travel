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

  getFilters() {
    return this.request({
      url : '/api/reports/filters',
      checkCached: () => this.store.data.filters,
      onLoading : request => this.store.filtersLoading(request),
      onLoad : result => this.store.filtersLoaded(result.body),
      onError : e => this.store.filtersError(e)
    });
  }

  getReport(query){
    return this.request({
      url : `/api/reports?${query}`,
      checkCached: () => this.store.data.reports[query],
      onLoading : request => this.store.reportLoading(request, query),
      onLoad : result => this.store.reportLoaded(result.body, query),
      onError : e => this.store.reportError(e, query)
    });
  }

}

const service = new ReportsService();
export default service;
