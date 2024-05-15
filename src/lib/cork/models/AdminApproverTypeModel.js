import {BaseModel} from '@ucd-lib/cork-app-utils';
import AdminApproverTypeService from '../services/AdminApproverTypeService.js';
import AdminApproverTypeStore from '../stores/AdminApproverTypeStore.js';

class AdminApproverTypeModel extends BaseModel {

  constructor() {
    super();

    this.store = AdminApproverTypeStore;
    this.service = AdminApproverTypeService;

    this.register('AdminApproverTypeModel');
  }

 /**
   * @description Query approvers
   * @param {String} args - an object with possible properties
   * id(s) single or array of ids
   * archived - archive approvers
   * active - active approvers
   * 
   */
  async query(args = {}) {
    args = this.service.sort(args);
    let state = this.store.data.query[args];;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.query(args);
      }

      if (state.state === 'loaded') { this.store.data.query = {} }
    } catch(e) {}
    return this.store.data.query[args];
  }

  /**
   * @description Create data of approvers
   * @param {String} data - data to create a new approvers
   */

   async create(data) {
    data = this.service.sort(data);
    try {
      let state = this.store.data.create[data];;
      await this.service.create(data);

      if (state.state === 'loaded') this.store.data.create = {} 

    } catch(e) {}

    const out = this.store.data.create;

    if ( !data ) {
      this.store.data.update = {};
    }

    return out;
  }

  /**
   * @description Update data of approvers
   * @param {String} data - data to update for approvers
   */
  async update(data) {
    data = this.service.sort(data);
    try { 
      let state = this.store.data.update[data];
      await this.service.update(data);

      if (state.state === 'loaded') this.store.data.update = {} 
    } catch(e) {}

    const out = this.store.data.update;

    if ( !data ) {
      this.store.data.update = {};
    }

    return out;
  }
}

const model = new AdminApproverTypeModel();
export default model;