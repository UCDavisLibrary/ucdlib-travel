import {BaseStore} from '@ucd-lib/cork-app-utils';

class EmployeeStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      iamQuery: {},
      iamById: {},
      activeTitles: {}
    };
    this.events = {
      IAM_QUERIED: 'iam-queried',
      IAM_BY_ID_QUERIED: 'iam-by-id-queried',
      ACTIVE_TITLES_FETCHED: 'active-titles-fetched'
    };
  }

  activeTitlesLoading(request) {
    this._setActiveTitlesState({
      state : this.STATE.LOADING,
      request
    });
  }

  activeTitlesLoaded(payload) {
    this._setActiveTitlesState({
      state : this.STATE.LOADED,
      payload
    });
  }

  activeTitlesError(error) {
    this._setActiveTitlesState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setActiveTitlesState(state) {
    this.data.activeTitles = state;
    this.emit(this.events.ACTIVE_TITLES_FETCHED, state);
  }

  iamQueryLoading(request, query) {
    this._setIamQueryState({
      state : this.STATE.LOADING,
      request
    }, query);
  }

  iamQueryLoaded(payload, query) {
    this._setIamQueryState({
      state : this.STATE.LOADED,
      payload
    }, query);
  }

  iamQueryError(error, query) {
    this._setIamQueryState({
      state : this.STATE.ERROR,
      error
    }, query);
  }

  _setIamQueryState(state, query) {
    this.data.iamQuery[query] = state;
    this.emit(this.events.IAM_QUERIED, state);
  }

  iamQueryByIdLoading(request, id, idType) {
    this._setIamQueryByIdState({
      state : this.STATE.LOADING,
      request
    }, id, idType);
  }

  iamQueryByIdLoaded(payload, id, idType) {
    this._setIamQueryByIdState({
      state : this.STATE.LOADED,
      payload
    }, id, idType);
  }

  iamQueryByIdError(error, id, idType) {
    this._setIamQueryByIdState({
      state : this.STATE.ERROR,
      error
    }, id, idType);
  }

  _setIamQueryByIdState(state, id, idType) {
    this.data.iamById[this.getIamIdKey(id, idType)] = state;
    this.emit(this.events.IAM_BY_ID_QUERIED, state);
  }

  getIamIdKey(id, idType) {
    return idType+'--'+id;

  }

}

const store = new EmployeeStore();
export default store;
