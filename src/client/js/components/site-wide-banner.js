import { LitElement } from 'lit';
import { render } from "./site-wide-banner.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

/**
 * @description Generic dialog modal for app-wide use
 * See AppStateModel.showDialogModal() for usage and accepted parameters
 */
export default class SiteWideBanner extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      bannerText: {type: String},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.bannerText = 'hi maybe this';
  }

}

customElements.define('site-wide-banner', SiteWideBanner);