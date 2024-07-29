import { LitElement } from 'lit';
import {render} from "./character-limit-tracker.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import typeTransform from '../../../lib/utils/typeTransform.js';

/**
 * @class CharacterLimitTracker
 * @description Component that tracks and displays the characters and limit of preceding input or textarea
 * @property {Object} approvalRequest - The approval request object
 */
export default class CharacterLimitTracker extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      input: {type: String},
      defaultValue: {type: Integer},
      characterLimit: {type: Integer},
      warningThreshold: {type: Integer},
      message: {type: String}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.input = '';
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
    if ( p.has('input')){
      this._updateColor();
      this.message = `${this.input.length}/${this.characterLimit} characters`;
    }

    this._setStatus(p);
  }

  /**
   * @description Attached to input event on main search input field
   * @param {Event} e - input event
   */
  _onInput(e) {
    this.query = e.target.value;
    this.selectedText = '';
    this.selectedObject = {};
    this.selectedValue = '';
  }

  /**
   * @description Update the color based on input length
   */
  _updateColor() {
    if (this.input.length > this.characterLimit) {
      this.color = 'red';
    } else if (this.input.length > this.warningThreshold) {
      this.color = 'yellow';
    } else {
      this.color = '';
    }
  }
}

customElements.define('character-limit-tracker', CharacterLimitTracker);
