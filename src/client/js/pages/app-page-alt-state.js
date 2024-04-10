import { LitElement } from 'lit';
import { render, styles } from "./app-page-alt-state.tpl.js";
import { MutationObserverController } from "@ucd-lib/theme-elements/utils/controllers/index.js";

/**
 * @description This page displays app states other than loaded. e.g. loading, error, etc.
 * It should be controled via AppStateModel.
 * e.g. to show a loading state when a page is fetching it's required data, from the page, you would do:
 * async _onAppStateUpdate(state) {
 *   if ( this.id !== state.page ) return;
 *   this.AppStateModel.showLoading();
 *   const d = await this.getPageData();
 *   const hasError = d.some(e => e.state === 'error');
 *   if ( !hasError ) this.AppStateModel.showLoaded(this.id);
 * }
 * and then you would handle error state in the model events:
 * async _onDataFetch(e) {
 *  if ( e.state === 'error ) {
 *   this.AppStateModel.showError(e); or this.AppStateModel.showError('custom error message');
 * }
 */
export default class AppPageAltState extends LitElement {

  static get properties() {
    return {
      state: {type: String},
      errorMessage: {type: String, attribute: 'error-message'},
      isVisible: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.state = 'loading';
    this.errorMessage = '';

    this.isVisible = false;
    new MutationObserverController(this, {attributes : true, attributeFilter : ['style']});
  }

  /**
   * @description Lit lifecycle method
   * @param {*} props
   */
  willUpdate(props){
    if ( props.has('state') ){
      if ( !['error', 'loading'].includes(this.state)){
        this.state = 'loading';
      }
    }
  }

  /**
   * @description Fires when style changes (aka when this page is shown/hidden)
   * Delays showing loading screen, so we don't get a jarring flash of content for quick loads
   */
  _onChildListMutation(){
    setTimeout(() => {
      this.isVisible = this.style.display != 'none';
    }, 10);
  }
}

customElements.define('app-page-alt-state', AppPageAltState);
