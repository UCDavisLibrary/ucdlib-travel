import BaseService from './BaseService.js';
import AdminApproverTypeStore from '../stores/AdminApproverTypeStore.js';

class AdminApproverTypeService extends BaseService {

  constructor() {
    super();
    this.store = AdminApproverTypeStore;

  }

  query(data){
    let arrStr = encodeURIComponent(JSON.stringify(data));
    return this.request({
      url : `/api/admin/approver-type?data=${arrStr}`,

      checkCached: () => this.store.data.query[data],
      onLoading : request => this.store.queryLoading(request, data),
      onLoad : result => this.store.queryLoaded(result.body, data),
      onError : e => this.store.queryError(e, data)
    });
  }

  create(data){
    return this.request({
      url : `/api/admin/approver-type`,
      fetchOptions : {
        method : 'POST',
        body : data
      },
      json: true,
      checkCached: () => this.store.data.create[data],
      onLoading : request => this.store.createLoading(request, data),
      onLoad : result => this.store.createLoaded(result.body, data),
      onError : e => this.store.createError(e, data)
    });
  }

  update(data) {
    return this.request({
      url : `/api/admin/approver-type`,
      fetchOptions : {
        method : 'PUT',
        body : data
      },
      json: true,
      checkCached: () => this.store.data.update[data],
      onLoading : request => this.store.updateLoading(request),
      onLoad : result => this.store.updateLoaded(result.body),
      onError : e => this.store.updateError(e)
    });

  }

}

const service = new AdminApproverTypeService();
export default service;
