import { AppStateStore } from "@ucd-lib/cork-app-state";

/**
 * @description Implementation of AppStateStore
 */
class AppStateStoreImpl extends AppStateStore {
  constructor() {
    super();
    this.defaultPage = 'home';

    // TODO: Replace these with your own default values
    this.breadcrumbs = {
      home: {text: 'Home', link: '/'},
      foo: {text: 'Foo', link: '/foo'}
    };

    this.userProfile = {};

    this.events.PAGE_STATE_UPDATE = 'page-state-update';
    this.events.PAGE_TITLE_UPDATE = 'page-title-update';
    this.events.BREADCRUMB_UPDATE = 'breadcrumb-update';
    this.events.ALERT_BANNER_UPDATE = 'alert-banner-update';
  }
}

const store = new AppStateStoreImpl();
export default store;
