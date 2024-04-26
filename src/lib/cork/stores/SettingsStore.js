import {BaseStore} from '@ucd-lib/cork-app-utils';

class SettingsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      byCategory: {},
      lastUpdate: {}
    };
    this.events = {
      CATEGORY_FETCHED: 'settings-category-fetched',
      SETTINGS_UPDATED: 'settings-updated'
    };
  }

  byCategoryLoading(request, category) {
    this._setByCategoryState({
      state : this.STATE.LOADING,
      request
    }, category);
  }

  byCategoryLoaded(payload, category) {
    this._setByCategoryState({
      state : this.STATE.LOADED,
      payload
    }, category);
  }

  byCategoryError(error, category) {
    this._setByCategoryState({
      state : this.STATE.ERROR,
      error
    }, category);
  }

  _setByCategoryState(state, category) {
    this.data.byCategory[category] = state;
    this.emit(this.events.CATEGORY_FETCHED, state);
  }

  updateLoading(request) {
    this._setUpdateState({
      state : this.STATE.LOADING,
      request
    });
  }

  updateLoaded(payload) {
    this._setUpdateState({
      state : this.STATE.LOADED,
      payload
    });
  }

  updateError(error) {
    this._setUpdateState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setUpdateState(state) {
    this.data.lastUpdate = state;
    this.emit(this.events.SETTINGS_UPDATED, state);
  }

}

const store = new SettingsStore();
export default store;
