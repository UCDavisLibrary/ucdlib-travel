import { LitElement } from 'lit';
import { render } from "./user-current-allocation-summary.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

export default class UserCurrentAllocationSummary extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      pageId: {type: String, attribute: 'page-id'}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel', 'SettingsModel');
  }

  async init(){}

}

customElements.define('user-current-allocation-summary', UserCurrentAllocationSummary);
