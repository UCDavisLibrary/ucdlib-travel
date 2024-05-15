import BaseService from './BaseService.js';
import AdminApproverTypeStore from '../stores/AdminApproverTypeStore.js';

class AdminApproverTypeService extends BaseService {

  constructor() {
    super();
    this.store = AdminApproverTypeStore;

  }

  query(data){
    data = this.sort(data);
    let id = data[0].id ? `id=${encodeURIComponent(JSON.stringify(data[0].id))}&` :``;

    return this.request({
      url : `/api/admin/approver-type?${id}status=${data[0].status}`,

      checkCached: () => this.store.data.query[JSON.stringify(data)],
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
      onLoading : request => this.store.updateLoading(request),
      onLoad : result => this.store.updateLoaded(result.body),
      onError : e => this.store.updateError(e)
    });

  }

  sort(data){
    if(data.label) {
      data = [data];
      let sortData = data.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
      for(var i = 0; i < sortData.length; i++) {
          if (Array.isArray(sortData[i].label)) {
              sortData[i].label;
          }
      }
      return sortData[0];
    }else {
      let sortData = data.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
      for(var i = 0; i < sortData.length; i++) {
          if (Array.isArray(sortData[i].id)) {
              sortData[i].id;
          }
      }
      return sortData;
    }
    
  }
}

const service = new AdminApproverTypeService();
export default service;
