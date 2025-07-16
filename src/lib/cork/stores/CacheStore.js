import {BaseStore} from '@ucd-lib/cork-app-utils';

class CacheStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      searchCache: {},
      deleteCache: {},
      getCount: {}
    };
    this.events = {
      SEARCH_CACHE: 'search-cache',
      DELETE_CACHE: 'delete-cache',
      GET_COUNT: 'get-count',
    };
  }

  searchCacheLoading(request, q) {
    this._setSearchCacheState( {
      state : this.STATE.LOADING,
      request,
      q
    });
  }

  searchCacheLoaded(payload, q) {
    this._setSearchCacheState( {
      state : this.STATE.LOADED,
      payload,
      q
    });
  }

  searchCacheError(error, q) {
    this._setSearchCacheState( {
      state : this.STATE.ERROR,
      error,
      q
    });
  }

  _setSearchCacheState(state) {
    this.data.searchCache = state;
    this.emit(this.events.SEARCH_CACHE, state);
  }

  deleteCacheLoading(request, q) {
    this._setDeleteCacheState( {
      state : this.STATE.LOADING,
      request,
      q
    });
  }

  deleteCacheLoaded(payload, q) {
    this._setDeleteCacheState( {
      state : this.STATE.LOADED,
      payload,
      q
    });
  }

  deleteCacheError(error, q) {
    this._setDeleteCacheState( {
      state : this.STATE.ERROR,
      error,
      q
    });
  }

  _setDeleteCacheState(state) {
    this.data.deleteCache = state;
    this.emit(this.events.DELETE_CACHE, state);
  }


  getCountCacheLoading(request) {
    this._setCountCacheState( {
      state : this.STATE.LOADING,
      request
    });
  }

  getCountCacheLoaded(payload) {
    this._setCountCacheState( {
      state : this.STATE.LOADED,
      payload
    });
  }

  getCountCacheError(error) {
    this._setCountCacheState( {
      state : this.STATE.ERROR,
      error
    });
  }

  _setCountCacheState(state) {
    this.data.getCount = state;
    this.emit(this.events.GET_COUNT, state);
  }
  

}

const store = new CacheStore();
export default store;