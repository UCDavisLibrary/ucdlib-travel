import {BaseStore} from '@ucd-lib/cork-app-utils';

class ReportsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      foo: {}
    };
    this.events = {
      FOO_FETCHED: 'foo-fetched'
    };
  }

  getFooLoading(request) {
    this._setFooState({
      state : this.STATE.LOADING,
      request
    });
  }

  getFooLoaded(payload) {
    this._setFooState({
      state : this.STATE.LOADED,
      payload
    });
  }

  getFooError(error) {
    this._setFooState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setFooState(state) {
    this.data.foo = state;
    this.emit(this.events.FOO_FETCHED, state);
  }

}

const store = new ReportsStore();
export default store;
