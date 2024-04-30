import {BaseStore} from '@ucd-lib/cork-app-utils';

class LineItemsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      activeLineItems: {},
      lineItemsCreated: {},
      lineItemsUpdated: {}
    };
    this.events = {
      ACTIVE_LINE_ITEMS_FETCHED: 'active-line-items-fetched',
      LINE_ITEM_CREATED: 'line-item-created',
      LINE_ITEM_UPDATED: 'line-item-updated'
    };
  }

  activeLineItemsLoading(request) {
    this._setActiveLineItemsState({
      state : this.STATE.LOADING,
      request
    });
  }

  activeLineItemsLoaded(payload) {
    this._setActiveLineItemsState({
      state : this.STATE.LOADED,
      payload
    });
  }

  activeLineItemsError(error) {
    this._setActiveLineItemsState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setActiveLineItemsState(state) {
    this.data.activeLineItems = state;
    this.emit(this.events.ACTIVE_LINE_ITEMS_FETCHED, state);
  }

  lineItemsCreatedLoading(request, timestamp) {
    this._setLineItemsCreatedState({
      state : this.STATE.LOADING,
      request
    }, timestamp);
  }

  lineItemsCreatedLoaded(payload, timestamp) {
    this._setLineItemsCreatedState({
      state : this.STATE.LOADED,
      payload
    }, timestamp);
  }

  lineItemsCreatedError(error, timestamp) {
    this._setLineItemsCreatedState({
      state : this.STATE.ERROR,
      error
    }, timestamp);
  }

  _setLineItemsCreatedState(state, timestamp) {
    this.data.lineItemsCreated[timestamp] = state;
    this.emit(this.events.LINE_ITEM_CREATED, state);
  }

  lineItemsUpdatedLoading(request, timestamp) {
    this._setLineItemsUpdatedState({
      state : this.STATE.LOADING,
      request
    }, timestamp);
  }

  lineItemsUpdatedLoaded(payload, timestamp) {
    this._setLineItemsUpdatedState({
      state : this.STATE.LOADED,
      payload
    }, timestamp);
  }

  lineItemsUpdatedError(error, timestamp) {
    this._setLineItemsUpdatedState({
      state : this.STATE.ERROR,
      error
    }, timestamp);
  }

  _setLineItemsUpdatedState(state, timestamp) {
    this.data.lineItemsUpdated[timestamp] = state;
    this.emit(this.events.LINE_ITEM_UPDATED, state);
  }

}

const store = new LineItemsStore();
export default store;
