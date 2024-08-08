import {BaseModel} from '@ucd-lib/cork-app-utils';
import LineItemsService from '../services/LineItemsService.js';
import LineItemsStore from '../stores/LineItemsStore.js';

class LineItemsModel extends BaseModel {

  constructor() {
    super();

    this.store = LineItemsStore;
    this.service = LineItemsService;

    this.register('LineItemsModel');
  }

  /**
   * @description Get all active (non-archived) line items
   */
  async getActiveLineItems(){
    let state = this.store.data.activeLineItems;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getActiveLineItems();
      }
    } catch(e) {}

    this.store.emit(this.store.events.ACTIVE_LINE_ITEMS_REQUESTED, this.store.data.activeLineItems);
    return this.store.data.activeLineItems;
  }

  /**
   * @description Create a new line item
   * @param {Object} payload - line item data - see db-models/expenditureOptions.js
   */
  async createLineItem(payload) {
    let timestamp = Date.now();
    try {
      await this.service.createLineItem(payload, timestamp);
    } catch(e) {}
    const state = this.store.data.lineItemsCreated[timestamp];
    if ( state && state.state === 'loaded' ) {
      this.store.data.activeLineItems = {};
    }
    return state;
  }

  /**
   * @description Update a line item
   * @param {Object} payload - line item data - see db-models/expenditureOptions.js
   */
  async updateLineItem(payload) {
    let timestamp = Date.now();
    try {
      await this.service.updateLineItem(payload, timestamp);
    } catch(e) {}
    const state = this.store.data.lineItemsUpdated[timestamp];
    if ( state && state.state === 'loaded' ) {
      this.store.data.activeLineItems = {};
    }
    return state;

  }

}

const model = new LineItemsModel();
export default model;
