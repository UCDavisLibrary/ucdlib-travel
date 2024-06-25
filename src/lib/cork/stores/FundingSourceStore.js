import {BaseStore} from '@ucd-lib/cork-app-utils';

class FundingSourceStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      activeFundingSources: {}
    };
    this.events = {
      ACTIVE_FUNDING_SOURCES_FETCHED: 'active-funding-sources-fetched',
      ACTIVE_FUNDING_SOURCES_REQUESTED: 'active-funding-sources-requested'
    };
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
