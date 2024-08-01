import { LitElement } from 'lit';
import {render} from "./character-limit-tracker.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";


/**
 * @class CharacterLimitTracker
 * @description Component that tracks and displays the characters and limit of preceding input or textarea
 * @property {Object} approvalRequest - The approval request object
 */
export default class CharacterLimitTracker extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      value: {type: String},
      defaultValue: {type: Number},
      characterLimit: {type: Number},
      warningThreshold: {type: Number},
      message: {type: String}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.value = '';
    this.characterLimit = 0;
    this.warningThreshold = 0;
    this.message = '';
    this.color = '';
  }

  /**
     * @description LitElement lifecycle called when element is updated
     * @param {*} p - Changed properties
     */
  async willUpdate(p) {
    if ( p.has('value')){
      this.value !=undefined ? this._updateMessage() : this.message = '';
    }
  }

  /**
   * @description Update the color based on input length
   */
  _updateMessage() {
    this.message = `${this.value.length} / ${this.characterLimit} characters`;
    if (this.value.length > this.characterLimit) {
      this.color = 'red';
      this.message = `${this.value.length} / ${this.characterLimit} characters (over limit)`;
    } else if (this.value.length > this.characterLimit - this.warningThreshold) {
      this.color = 'yellow';
    } else {
      this.color = '';
    }
  }

  /**
   * @description calculate warning threshold
   */
  _calculateWarningThreshold() {
    this.warningThreshold = this.characterLimit / 5;
  }

}

customElements.define('character-limit-tracker', CharacterLimitTracker);
