import { LitElement } from 'lit';
import { render } from "./app-main.tpl.js";

// brand components
import '@ucd-lib/theme-elements/brand/ucd-theme-primary-nav/ucd-theme-primary-nav.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-header/ucd-theme-header.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-quick-links/ucd-theme-quick-links.js'
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

// import cork models
import "../../lib/cork/models/AdminApproverTypeModel.js";
import "../../lib/cork/models/ApprovalRequestModel.js";
import "../../lib/cork/models/DepartmentModel.js";
import "../../lib/cork/models/EmployeeAllocationModel.js";
import "../../lib/cork/models/EmployeeModel.js";
import "../../lib/cork/models/SettingsModel.js";
import "../../lib/cork/models/FundingSourceModel.js";
import "../../lib/cork/models/LineItemsModel.js";

// auth
import Keycloak from 'keycloak-js';
import AuthModel from "../../lib/cork/models/AuthModel.js";

Registry.ready();

// registry of app page bundles - pages are dynamically loaded on appStateUpdate
import bundles from "./pages/bundles/index.js";

import "./pages/app-page-alt-state.js";
import "./pages/app-page-home.js";

// global components
import "./components/app-toast.js";
import "./components/app-dialog-modal.js";

// utils
import urlUtils from '../../lib/utils/urlUtils.js';

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
      bannerText: {type: String},
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

    this.pageTitle = 'This is a test title';
    this.bannerText = '';
    this.showPageTitle = false;
    this.breadcrumbs = [];
    this.showBreadcrumbs = false;
    this.userIsAuthenticated = false;
    this.appTitle = appConfig.title;
    this.pageIsLoaded = false;

    this._notLoadedPageId = 'page-not-loaded';
    this.pageState = 'loading';
    this.errorMessage = '';

    this.settingsCategory = 'app-main';
    const models = ['AppStateModel','SettingsModel'];
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
    if ( ['home', 'page-not-loaded'].includes(page) ) {
      this.checkForSettingsData();

      this.page = page;
      window.scroll(0,0);
      return;
    }
    if ( !page ) {
      this.AppStateModel.showError('Page not found');
      return;
    }

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

    this.checkForSettingsData();

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
   * @description checks for page data from the settings model. Repeated here because
   * settings need to load independent of page data
   */
  async checkForSettingsData() {
    const d = await this.getPageData();
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if ( hasError ) {
      this.AppStateModel.showError(d);
      console.error('AppMain: error loading page data', d);
      return;
    }

    this.SettingsModel.getByKey('site_wide_banner') != 'default' ? this.bannerText = this.SettingsModel.getByKey('site_wide_banner') : this.bannerText = '';

    this.requestUpdate();

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
   * @description Get all data required for rendering this page
   */
    async getPageData(){
      const promises = [];
      promises.push(this.SettingsModel.getByCategory(this.settingsCategory));
      const resolvedPromises = await Promise.allSettled(promises);
      return resolvedPromises;
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

    if( bundle == 'approval-requests' ) {
      return import(/* webpackChunkName: "approval-requests" */ "./pages/bundles/approval-requests.js");
    } else if( bundle == 'admin' ) {
      return import(/* webpackChunkName: "admin" */ "./pages/bundles/admin.js");
    } else if( bundle == 'reports' ) {
      return import(/* webpackChunkName: "reports" */ "./pages/bundles/reports.js");
    } else if( bundle == 'reimbursement-requests' ) {
      return import(/* webpackChunkName: "reimbursement-requests" */ "./pages/bundles/reimbursement-requests.js");
    }
    console.warn(`AppMain: bundle ${bundle} not found for page ${page}. Check pages/bundles`);
    return true;
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

    // replace state in history to remove keycloak state
    // const hash = urlUtils.stripFromHash(['iss']);
    // window.history.replaceState(null, null, hash ? `#${hash}` : window.location.pathname);

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

