import {BaseStore} from '@ucd-lib/cork-app-utils';

class CacheStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      searchCache: {},
      deleteCache: {},
      getCacheCount: {}
    };
    this.events = {
      SEARCH_CACHE: 'search-cache',
      DELETE_CACHE: 'delete-cache',
      GET_CACHE_COUNT: 'get-cache-count',
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


  getCacheCountCacheLoading(request) {
    this._setCountCacheState( {
      state : this.STATE.LOADING,
      request
    });
  }

  getCacheCountCacheLoaded(payload) {
    this._setCountCacheState( {
      state : this.STATE.LOADED,
      payload
    });
  }

  getCacheCountCacheError(error) {
    this._setCountCacheState( {
      state : this.STATE.ERROR,
      error
    });
  }

  _setCountCacheState(state) {
    this.data.getCacheCount = state;
    this.emit(this.events.GET_CACHE_COUNT, state);
  }
  

}

const store = new CacheStore();
export default store;