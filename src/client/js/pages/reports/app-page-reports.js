import { LitElement } from 'lit';
import {render} from "./app-page-reports.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class AppPageReports extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      page: {type: String},
      helpUrl: {type: String}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);
    this.page = this.getPageId('403');
    this.helpUrl = ''

    this._injectModel('AppStateModel', 'ReportsModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Reports');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);


    const accessLevel = await this.ReportsModel.getAccessLevel();
    this.logger.info('access level fetched', accessLevel);
    if ( accessLevel.state === 'error' ) {
      this.AppStateModel.showError(accessLevel, {ele: this});
      return;
    }

    if ( !accessLevel.payload.hasAccess){
      this.page = this.getPageId('403');
      this.helpUrl = accessLevel.payload.helpUrl;
      this.AppStateModel.showLoaded(this.id);
      return;
    }

    // todo: load page content

    this.page = this.getPageId('builder');
    this.AppStateModel.showLoaded(this.id);
  }

  getPageId(page){
    return `${this.id}-page--${page}`;
  }

}

customElements.define('app-page-reports', AppPageReports);
