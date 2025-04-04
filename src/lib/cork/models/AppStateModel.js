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
    let p = '';
    const baseRoute = this.getPathByIndex(0, update);
    const secondaryRoute = this.getPathByIndex(1, update);
    const tertiaryRoute = this.getPathByIndex(2, update);

    if ( !baseRoute ) {
      p = this.store.defaultPage;
    }

    else if ( baseRoute === 'admin' ){
      if ( secondaryRoute === 'approvers' ){
        p = 'admin-approvers';
      } else if ( secondaryRoute === 'settings' ){
        p = 'admin-settings';
      } else if ( secondaryRoute === 'allocations' ){
        if ( tertiaryRoute === 'new' ){
          p = 'admin-allocations-new';
        } else {
          p = 'admin-allocations';
        }
      } else if ( secondaryRoute === 'approval-requests' ){
        p = 'admin-approval-requests';
      } else if ( secondaryRoute === 'line-items' ){
        p = 'admin-line-items';
      } else if ( secondaryRoute === 'email-settings' ){
        p = 'admin-email-settings';
      } else if ( secondaryRoute === 'reimbursement' ){
        p = 'admin-reimbursement';
      } else if ( !secondaryRoute ) {
        p = 'admin';
      }
    }

    else if ( baseRoute === 'approval-request' ){
      if ( secondaryRoute ){
        if ( secondaryRoute === 'new' ){
          p = 'approval-request-new';
        } else if ( secondaryRoute === 'confirm' ){
          p = 'approval-request-confirm';
        } else if ( secondaryRoute === 'approve' ){
          p = 'approver';
        } else if ( secondaryRoute === 'new-reimbursement' && appConfig.featureFlags.reimbursementRequest ){
          p = 'reimbursement-new';
        } else {
          p = 'approval-request';
        }
      } else {
        p = 'approval-requests';
      }
    }

    else if ( baseRoute === 'reimbursement-request' ){
      if ( secondaryRoute ){
        p = 'reimbursement';
      }
    }

    else if ( baseRoute === 'approve' ){
      p = 'approver-landing';
    }

    else if ( baseRoute === 'reports' ){
      p = 'reports';
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
    const toStrip = ['state', 'session_state', 'code', 'iss'];
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
   * @description Show dismissable toast banner in popup. Will disappear on next app-state-update event
   * @param {Object} options Toast object with the following properties:
   * - message {String} - The message to display
   * - type {String} - The type of toast. Options: 'info', 'error', 'success'
   */
  showToast(option){
    if ( Array.isArray(option) ) return;

    if( typeof option === 'object' )
      this.store.emit('toast-update', option);

  }

  /**
   * @description Show a modal dialog box.
   * To listen for the action event, add the _onDialogAction method to your element and then filter on e.action
   * @param {Object} options Dialog object with the following properties:
   * - title {String} - The title of the dialog (optional)
   * - content {String} - The html content of the dialog (optional, but should probably be included)
   * - actions {Array} - Array of objects with the following properties:
   *  - text {String} - The text of the button
   *  - value {String} - The action slug that is emitted when button is clicked
   *  - invert {Boolean} - Invert the button color (optional)
   *  - color {String} - The brand color string of the button (optional)
   * - data {Object} - Any data to pass along in the action event (optional)
   *
   * If the actions array is empty, a 'Dismiss' button will be added automatically
   */
  showDialogModal(options={}){
    if ( !options.actions ) {
      options.actions = [{text: 'Dismiss', action: 'dismiss'}];
    }
    if ( !options.data ) {
      options.data = {};
    }
    if ( !options.title ) {
      options.title = '';
    }
    if ( !options.content ) {
      options.content = '';
    }
    this.store.emit('dialog-open', options);
  }


  /**
   * @description Dismissing all toasts in the queue
   */
  dismissToast(){
    let dismissMessage = "Toast Dismissed";
    this.store.emit('toast-dismiss', {message: dismissMessage});
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
  showError(msg='', kwargs={}){
    let fallbackMessage = kwargs.fallbackMessage || '';
    let ele = kwargs.ele;
    let errorMessage = '';

    // if array, find and use first error
    if ( Array.isArray(msg) ) {
      msg = msg.find(m => m.status === 'rejected' || m.value.state === 'error');
      if ( !msg ) msg = fallbackMessage;
    }

    if ( typeof msg === 'object' ) {

      // is object from Promise.allSettled
      if ( msg.status === 'fulfilled' ){
        msg = msg.value;
      }

      // try to get error message from cork-app-utils response object
      if ( msg?.error?.response?.status == 404 ){
        errorMessage = 'Page not found';
      } else if ( msg?.error?.response?.status == 401 ){
        errorMessage = 'You need to authenticate to view this page';
      } else if ( msg?.error?.response?.status == 403 ){
        errorMessage = 'You are not authorized to view this page';
      }else if ( msg?.error?.message ) {
        errorMessage = msg?.error?.message;
      } else {
        errorMessage = fallbackMessage;
      }

      if ( ele ){
        if ( msg?.error?.response?.status >= 500 ){
          const e = JSON.parse(JSON.stringify(msg));
          e.response = {
            status: msg?.error?.response?.status,
            statusText: msg?.error?.response?.statusText,
            url: msg?.error?.response?.url
          };
          ele.logger.error('network', e);
        } else if (msg?.error?.details instanceof TypeError){
          ele.logger.error('TypeError', msg?.error?.details);
        }
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
    let ele = document.querySelector('ucd-theme-header');
    if ( ele ) {
      ele.close();
    }
    ele = document.querySelector('ucd-theme-quick-links');
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

  /**
   * @description Page passed is the active page
   * @param {Element|String} page - The page to check
   * @returns {Boolean}
   */
  isActivePage(page){
    page = typeof page === 'string' ? page : page.id;
    return this.store.data.page === page;
  }

  /**
   * @description Scroll to an anchor on the page
   * @param {String} id - The id of the element to scroll to.
   * Note, shadowdom is disabled in most components, so make sure your id is unique to the application.
   * @param {Number} pxOffset - Optional. The number of pixels to offset the scroll.
   * Defaults to 65 (to account for the sticky header).
   */
  scrollToAnchor(id, pxOffset=65){
    let ele = document.getElementById(id);
    if ( ele ){
      const rect = ele.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - pxOffset;

      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }

  }

}

const model = new AppStateModelImpl();
export default model;

