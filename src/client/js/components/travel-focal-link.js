import { LitElement } from 'lit';
import { render } from "./travel-focal-link.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class TravelFocalLink extends Mixin(LitElement)
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
   * @description Attached to AppStateModel app-state-update event
   */
   _onAppStateUpdate(){
    this.hidden = true;
  }


}

customElements.define('travel-focal-link', TravelFocalLink);
