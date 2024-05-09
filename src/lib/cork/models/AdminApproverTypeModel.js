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

   async create(data) {
    try {
      let state = this.store.data.create[data];;

      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.create(data);
      }
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
    // payload = Array.isArray(payload) ? payload : [payload];
    let state = this.store.data.update[data];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.update(data);
      }
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
