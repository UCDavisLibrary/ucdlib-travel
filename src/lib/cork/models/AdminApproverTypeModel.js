import {BaseModel} from '@ucd-lib/cork-app-utils';
import AdminApproverTypeService from '../services/AdminApproverTypeService.js';
import AdminApproverTypeStore from '../stores/AdminApproverTypeStore.js';
import urlUtils from '../../utils/urlUtils.js';

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
    let query = args;
    args = urlUtils.queryStringFromObject(args);
    let state = this.store.data.query[args];

    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.query(args);
      }
    } catch(e) {}

    this.store.data.query[args].query = query;

    this.store.emit(this.store.events.APPROVER_TYPE_QUERY_REQUEST, this.store.data.query[args]);

    return this.store.data.query[args];
  }

  /**
   * @description Create data of approvers
   * @param {String} data - data to create a new approvers
   */

   async create(data) {
    try {
      await this.service.create(data);
    } catch(e) {}

    const state = this.store.data.create;
    if ( state && state.state === 'loaded' ) {
      this.store.data.query = {};
    }

    return state;
  }

  /**
   * @description Update data of approvers
   * @param {String} data - data to update for approvers
   */
  async update(data) {
    try {
      await this.service.update(data);
    } catch(e) {}

    const state = this.store.data.update;

    if ( state && state.state === 'loaded' ) {
      this.store.data.query = {};
    }

    return state;
  }
}

const model = new AdminApproverTypeModel();
export default model;
