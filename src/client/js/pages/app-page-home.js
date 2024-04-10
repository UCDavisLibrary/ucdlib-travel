import { LitElement } from 'lit';
import { render } from "./app-page-home.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class AppPageHome extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel');
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    // this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Home Page');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    // const d = await this.getPageData();
    // const hasError = d.some(e => e.state === 'error');
    // if ( !hasError ) this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Get any data required for rendering this page
   */
  async getPageData(){
    const promises = [];
    //promises.push(this.YourModel.getData());
    const resolvedPromises = await Promise.all(promises);
    return resolvedPromises;
  }

}

customElements.define('app-page-home', AppPageHome);
