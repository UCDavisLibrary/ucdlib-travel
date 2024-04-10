import { LitElement } from 'lit';
import { render } from "./app-main.tpl.js";

// brand components
import '@ucd-lib/theme-elements/brand/ucd-theme-primary-nav/ucd-theme-primary-nav.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-header/ucd-theme-header.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-branding-bar/ucdlib-branding-bar.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

// icons
import '@fortawesome/fontawesome-free/js/all.js';

// global event bus and model registry
import { Registry } from '@ucd-lib/cork-app-utils';

// app globals - should be loaded after cork-app-utils
import { appConfig, LitCorkUtils, Mixin } from "../../lib/appGlobals.js";

// init app state model
import AppStateModel from "../../lib/cork/models/AppStateModel.js";
AppStateModel.init(appConfig.routes);

// import data models
// TODO: Replace with your own models
import "../../lib/cork/models/FooModel.js";

// auth
// TODO: If not using auth, you can remove these imports
import Keycloak from 'keycloak-js';
import AuthModel from "../../lib/cork/models/AuthModel.js";

Registry.ready();

// registry of app page bundles - pages are dynamically loaded on appStateUpdate
import bundles from "./pages/bundles/index.js";
import "./pages/app-page-alt-state.js";

/**
 * @class AppMain
 * @description The main app web component, which controls routing and other app-level functionality.
 */
export default class AppMain extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      page: {type: String},
      pageTitle: {type: String},
      showPageTitle: {type: Boolean},
      breadcrumbs: {type: Array},
      showBreadcrumbs: {type: Boolean},
      userIsAuthenticated: {type: Boolean},
      appTitle: {type: String},
      pageIsLoaded: {state: true},
      pageState: {state: true},
      errorMessage: {state: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.loadedBundles = {};

    this.pageTitle = '';
    this.showPageTitle = false;
    this.breadcrumbs = [];
    this.showBreadcrumbs = false;
    this.userIsAuthenticated = false;
    this.appTitle = appConfig.title;
    this.pageIsLoaded = false;

    this._notLoadedPageId = 'page-not-loaded';
    this.pageState = 'loading';
    this.errorMessage = '';

    const models = ['AppStateModel'];
    if ( appConfig.auth.requireAuth ) {
      models.push('AuthModel');
    }
    this._injectModel(...models);
    this.page = this.AppStateModel.store.defaultPage;
    this.AppStateModel.refresh();
  }

  /**
   * @description LitElement lifecycle method called when element is about to update
   * @param {Map} props - changed properties
   */
  willUpdate(props) {
    if ( props.has('page') ) {
      this.pageIsLoaded = this.page !== this._notLoadedPageId;
    }
  }

  /**
   * @description Custom element lifecyle event
   * Hide the loading screen and show the app when the element is connected
   */
  connectedCallback(){
    super.connectedCallback();
    this.style.display = 'block';
    document.querySelector('#whole-screen-load').style.display = 'none';
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    const { page } = state;

    const bundle = this._getBundleName(page);
    let bundleAlreadyLoaded = true;

    // dynamically load code
    if ( !this.loadedBundles[bundle] ) {
      bundleAlreadyLoaded = false;
      //this.AppStateModel.showLoading(e.page);
      this.loadedBundles[bundle] = this._loadBundle(bundle, page);

    }
    await this.loadedBundles[bundle];

    // requested page element might also be listening to app-state-update
    // in which case we need to fire it again
    if ( !bundleAlreadyLoaded ){
      this.AppStateModel.refresh();
      if ( AuthModel._init ) {
        AuthModel._onAuthRefreshSuccess();
      }
    }

    this.page = page;
    window.scroll(0,0);
  }

  /**
   * @description bound to AppStateModel page-state-update event
   * Shows loading/error page instead of requested page if page is not loaded
   * Otherwise reselects the requested page
   * @param {Object} e - AppStateModel page-state-update event
   */
  _onPageStateUpdate(e) {
    const { state } = e;
    this.pageState = state;
    if ( state === 'error' ) {
      this.errorMessage = e.errorMessage;
    }
    this.page = e.state === 'loaded' ? e.page : this._notLoadedPageId;
  }

  /**
   * @description Listens for token-refreshed event from AuthModel
   * Fires when token is first created and when it is refreshed
   * @param {AccessToken} token - AccessToken instance from utils/AccessToken.js
   */
  _onTokenRefreshed(token) {
    this.userIsAuthenticated = !token.isEmpty;
  }

  /**
   * @description Listens for page-title-update event from AppStateModel
   * Sets the page title and whether or not to show it
   * @param {Object} title - {show: bool, text: string}
   */
  _onPageTitleUpdate(title) {
    const { show, text } = title;
    this.pageTitle = text;
    this.showPageTitle = show;
  }

  /**
   * @description Listens for breadcrumb-update event from AppStateModel
   * Sets the page breadcrumbs and whether or not to show them
   * @param {Object} breadcrumbs - {show: bool, breadcrumbs: [text: string, link: string]}
   */
  _onBreadcrumbUpdate(breadcrumbs) {
    const show = breadcrumbs.show;
    breadcrumbs = breadcrumbs.breadcrumbs;
    this.breadcrumbs = breadcrumbs;
    this.showBreadcrumbs = show;
  }

  /**
   * @description Get name of bundle a page element is in
   * @param {String} page
   * @returns {String}
   */
  _getBundleName(page){
    for (const bundle in bundles) {
      if ( bundles[bundle].includes(page) ){
        return bundle;
      }
    }
    return '';
  }

  /**
   * @description code splitting done here
   *
   * @param {String} bundle bundle to load
   * @param {String} page page to load. Just used for error logging.
   *
   * @returns {Promise}
   */
  _loadBundle(bundle, page='') {

    if( bundle == 'all' ) {
      return import(/* webpackChunkName: "pages" */ "./pages/bundles/all.js");
    }
    console.warn(`AppMain: bundle ${bundle} not found for page ${page}. Check pages/bundles/index.js`);
    return false;
  }

}

// init app by doing auth (if required) and defining the main app element
(async () => {
  if ( !appConfig.auth.requireAuth ) {
    customElements.define('app-main', AppMain);
    return;
  }

  // instantiate keycloak instance and save in appConfig global
  appConfig.auth.keycloakClient = new Keycloak({...appConfig.auth.clientInit, checkLoginIframe: true});
  const kc = appConfig.auth.keycloakClient;
  const silentCheckSsoRedirectUri = `${window.location.origin}/${AuthModel.silentCheckSsoRedirectUri}`

  // set up listeners keycloak listeners
  kc.onAuthRefreshError = () => {AuthModel.logout();};
  kc.onAuthError = () => {AuthModel.redirectUnauthorized();};
  kc.onAuthSuccess = () => {
    customElements.define('app-main', AppMain);
    AuthModel.init();
    AuthModel._onAuthRefreshSuccess();
  };
  kc.onAuthRefreshSuccess = () => {AuthModel._onAuthRefreshSuccess();};

  // initialize auth
  await kc.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri,
    scope: appConfig.auth.oidcScope
  });
  if ( !kc.authenticated) {
    await kc.login();
  }

})();

