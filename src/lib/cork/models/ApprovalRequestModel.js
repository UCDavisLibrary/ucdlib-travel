import {BaseModel} from '@ucd-lib/cork-app-utils';
import ApprovalRequestService from '../services/ApprovalRequestService.js';
import ApprovalRequestStore from '../stores/ApprovalRequestStore.js';

import urlUtils from '../../utils/urlUtils.js';

class ApprovalRequestModel extends BaseModel {

  constructor() {
    super();

    this.store = ApprovalRequestStore;
    this.service = ApprovalRequestService;

    this.register('ApprovalRequestModel');

    this.inject('EmployeeAllocationModel');

  }

  async query(query={}) {

    const queryString = urlUtils.queryObjectToKebabString(query);

    let state = this.store.data.fetched[queryString];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.query(queryString);
      }
    } catch(e) {}

    this.store.emit(this.store.events.APPROVAL_REQUESTS_REQUESTED, this.store.data.fetched[queryString]);

    return this.store.data.fetched[queryString];

  }

  /**
   * @description Get approval chain for most current version of a specific approval request
   * @param {*} approvalRequestId
   * @returns
   */
  async getApprovalChain(approvalRequestId) {
    let state = this.store.data.approvalChainByRequestId[approvalRequestId];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getApprovalChain(approvalRequestId);
      }
    } catch(e) {}

    return this.store.data.approvalChainByRequestId[approvalRequestId];
  }

  /**
   * @description Toggle the more reimbursement flag for an approval request
   * @param {Number} approvalRequestId - id of approval request to toggle
   * @returns
   */
  async moreReimbursementToggle(approvalRequestId) {
    const r = await this.service.moreReimbursementToggle(approvalRequestId);
    if ( r.state === 'loaded' ){
      this.clearCache();
      this.EmployeeAllocationModel.store.clearCache();
    }
    return r;
  }

  /**
   * @description Delete an approval request by id - must have always been in a draft state
   * @param {String} approvalRequestId - id of approval request to delete
   */
  async delete(approvalRequestId) {
    let timestamp = Date.now();
    try {
      await this.service.delete(approvalRequestId, timestamp);
    } catch(e) {}
    const state = this.store.data.deleted[timestamp];
    if ( state && state.state === 'loaded' ) {
      this.store.data.fetched = {};
      this.EmployeeAllocationModel.store.clearCache();
    }
    return state;
  }

  /**
   * @description Create a new approval request for the submitting user.
   * Can be a revision of a previously submitted request or a new request.
   * @param {Object} payload - See db model EntityFields property for expected payload
   * @param {Boolean} forceValidation - force validation of request - even if in draft state
   * @returns
   */
  async create(payload, forceValidation=false) {
    let timestamp = Date.now();
    try {
      await this.service.create(payload, timestamp, forceValidation);
    } catch(e) {}
    const state = this.store.data.created[timestamp];
    if ( state && state.state === 'loaded' ) {
      this.clearCache();
      this.EmployeeAllocationModel.store.clearCache();
    }
    return state;
  }

  /**
   * @description Clear the cache of fetched data
   */
  clearCache(){
    this.store.data.fetched = {};
    this.store.data.approvalChainByRequestId = {};
  }

  /**
   * @description Update the status of an approval request
   * @param {Number} approvalRequestId - id of approval request to update
   * @param {Object} action - action to take on approval request
   *  at the very least should have an 'action' property
   * @returns
   */
  async statusUpdate(approvalRequestId, action) {
    try {
      await this.service.statusUpdate(approvalRequestId, action);
    } catch(e) {}
    const state = this.store.data.statusUpdate[`${approvalRequestId}--${action.action}`];
    if ( state && state.state === 'loaded' ) {
      this.store.data.fetched = {};
      this.store.data.approvalChainByRequestId = {};
    }
    return state;
  }


}

const model = new ApprovalRequestModel();
export default model;
