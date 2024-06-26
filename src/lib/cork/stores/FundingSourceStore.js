import {BaseStore} from '@ucd-lib/cork-app-utils';

class FundingSourceStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      activeFundingSources: {},
      updated: {},
      created: {}
    };
    this.events = {
      ACTIVE_FUNDING_SOURCES_FETCHED: 'active-funding-sources-fetched',
      ACTIVE_FUNDING_SOURCES_REQUESTED: 'active-funding-sources-requested',
      FUNDING_SOURCE_UPDATED: 'funding-source-updated',
      FUNDING_SOURCE_CREATED: 'funding-source-created'
    };
  }

  createdLoading(request, requestBody, timestamp) {
    this._setCreatedState({
      state : this.STATE.LOADING,
      request,
      requestBody,
      timestamp
    });
  }

  createdLoaded(payload, requestBody, timestamp) {
    this._setCreatedState({
      state : this.STATE.LOADED,
      payload,
      requestBody,
      timestamp
    });
  }

  createdError(error, requestBody, timestamp) {
    this._setCreatedState({
      state : this.STATE.ERROR,
      error,
      requestBody,
      timestamp
    });
  }

  _setCreatedState(state) {
    this.data.created[state.timestamp] = state;
    this.emit(this.events.FUNDING_SOURCE_CREATED, state);
  }

  updatedLoading(request, requestBody, timestamp) {
    this._setUpdatedState({
      state : this.STATE.LOADING,
      request,
      requestBody,
      timestamp
    });
  }

  updatedLoaded(payload, requestBody, timestamp) {
    this._setUpdatedState({
      state : this.STATE.LOADED,
      payload,
      requestBody,
      timestamp
    });
  }

  updatedError(error, requestBody, timestamp) {
    this._setUpdatedState({
      state : this.STATE.ERROR,
      error,
      requestBody,
      timestamp
    });
  }

  _setUpdatedState(state) {
    this.data.updated[state.timestamp] = state;
    this.emit(this.events.FUNDING_SOURCE_UPDATED, state);
  }

  activeFundingSourcesLoading(request) {
    this._setActiveFundingSourcesState({
      state : this.STATE.LOADING,
      request
    });
  }

  activeFundingSourcesLoaded(payload) {
    this._setActiveFundingSourcesState({
      state : this.STATE.LOADED,
      payload
    });
  }

  activeFundingSourcesError(error) {
    this._setActiveFundingSourcesState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setActiveFundingSourcesState(state) {
    this.data.activeFundingSources = state;
    this.emit(this.events.ACTIVE_FUNDING_SOURCES_FETCHED, state);
  }

}

const store = new FundingSourceStore();
export default store;
