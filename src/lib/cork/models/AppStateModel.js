import {AppStateModel} from '@ucd-lib/cork-app-state';
import AppStateStore from '../stores/AppStateStore.js';
import { appConfig } from '../../appGlobals.js';

/**
 * @description Model for handling generic app state, such as routing
 */
class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();

    this.store = AppStateStore;

    if ( appConfig.auth?.requireAuth ) {
      this.inject('AuthModel');
    }
  }

  /**
   * @description Sets the current route state
   * @param {Object} update - Route state - Returned in AppStateUpdate
   * @returns
   */
  set(update) {

    if ( this.AuthModel && this.AuthModel.logOutRequested(update.location) ){
      this.showLoading();
      this.AuthModel.logout();
      return;
    }
    this.stripStateFromHash(update);
    this._setPage(update);
    this.setBreadcrumbs(false, update);
    this.closeNav();

    let res = super.set(update);

    return res;
  }

  /**
   * @description Fire an app-state-update event for the current location
   */
  refresh(){
    const state = this.store.data;
    this.store.emit(this.store.events.APP_STATE_UPDATE, state);
  }

  /**
   * @description Sets page id for a url location,
   * where page id corresponds to the id attribute of a child of ucdlib-pages in app-main.tpl.js
   * @param {Object} update
   */
  _setPage(update){
    if ( !update ) return;
    let p = this.store.defaultPage;
    const route = this.getPathByIndex(0, update);

    // TODO: Replace these with your own route->pageid mappings
    if ( route === 'foo' ){
      p = 'foo';
    }
    update.page = p;

  }

  /**
   * @description Updates title of page. Usually called from a page's _onAppStateUpdate method.
   * @param {String|Object} title Page title. If object passed, must be in format {show: bool, text: string}
   */
  setTitle(title){
    const t = {
      show: false,
      text: ''
    };
    if ( typeof title === 'string' ){
      t.show = true;
      t.text = title;
    } else if ( typeof title === 'object' ) {
      t.show = title.show === undefined ? true : title.show;
      t.text = title.text ? title.text : '';
    }
    this.store.emit('page-title-update', t);
  }

  /**
   * @description Remove extraneous state values from hash set by keycloak.
   * It interferes with the app's routing.
   * @param {*} update
   * @returns
   */
  stripStateFromHash(update){
    if ( !update || !update.location || !update.location.hash ) return;
    let hash = new URLSearchParams(update.location.hash);
    const toStrip = ['state', 'session_state', 'code'];
    let replace = false;
    for (const key of toStrip) {
      if ( hash.has(key) ) {
        hash.delete(key);
        replace = true;
      }
    }
    if ( !replace ) return;
    hash = hash.toString().replace('=','');
    update.location.hash = hash;
  }

  /**
   * @description Sets breadcrumbs
   * @param {Object|Array} breadcrumbs If array, must be in format [{text: 'Home', link: '/'}, {text: 'Foo', link: '/foo'}]
   * If object, must be in format {show: bool, breadcrumbs: array}
   */
  setBreadcrumbs(breadcrumbs){
    const b = {
      show: false,
      breadcrumbs: []
    }
    if ( Array.isArray(breadcrumbs) ) {
      b.breadcrumbs = breadcrumbs;
      b.show = true;
    } else if ( typeof breadcrumbs === 'object' ) {
      b.show = breadcrumbs.show === undefined ? true : breadcrumbs.show;
      b.breadcrumbs = breadcrumbs.breadcrumbs ? breadcrumbs.breadcrumbs : [];
    }
    for ( const crumb of b.breadcrumbs ) {
      crumb.text = crumb.text || '';
      crumb.link = crumb.link || '';
    }

    this.store.emit('breadcrumb-update', b);
  }

  /**
   * @description Show dismissable alert banner at top of page. Will disappear on next app-state-update event
   * @param {Object|String} options Alert message if string, config if object:
   * {message: 'alert!'
   * brandColor: 'double-decker'
   * }
   */
  showAlertBanner(options){
    if ( typeof options === 'string' ){
      options = {message: options};
    }
    this.store.emit('alert-banner-update', options);
  }

  /**
   * @description Show the app's loading page
   */
  showLoading(){
    this.store.emit('page-state-update', {state: 'loading'});
  }

  /**
   * @description Show the app's error page
   * @param {String|Object} msg Error message to show or cork-app-utils response object
   */
  showError(msg=''){
    let errorMessage = ''
    if ( typeof msg === 'object' ) {
      console.error(msg);
      if ( msg?.error?.response?.status == 404 ){
        errorMessage = 'Page not found';
      } else if ( msg?.error?.response?.status == 401 ){
        errorMessage = 'You need to authenticate to view this page';
      } else if ( msg?.error?.response?.status == 403 ){
        errorMessage = 'You are not authorized to view this page';
      }else if ( msg?.error?.message ) {
        errorMessage = msg?.error?.message;
      }
    } else {
      errorMessage = msg;
    }
    this.store.emit('page-state-update', {state: 'error', errorMessage});
  }

  /**
   * @description Return app to a non-error/non-loading status
   * @param {String} page - The page to show.
   */
  showLoaded(page){
    if ( page ){
      this.store.emit('page-state-update', {state: 'loaded', page});
    } else {
      console.warn('showLoaded called without page argument');
    }

  }

  /**
   * @description Close the app's primary nav menu
   */
  closeNav(){
    const ele = document.querySelector('ucd-theme-header');
    if ( ele ) {
      ele.close();
    }
  }

  /**
   * @description Get URL path at the given index
   * @param {Number} index - Optional. The index of the path to get. Defaults to 0.
   * e.g. https://foo.edu/0/1/2/3
   * @param {Object} update - Optional. The app state to use. Defaults to this.store.data.
   * @returns
   */
  getPathByIndex( index, update ){
    if ( !update ) update = this.store.data;
    if ( !index ) index = 0;
    return update?.location?.path?.[index];
  }

}

const model = new AppStateModelImpl();
export default model;

