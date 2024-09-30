import { LitElement } from 'lit';
import {render} from "./email-template.tpl.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

/**
 * @class EmailTemplate
 * @description Component that gives the email template 
 *
 * @property {String} emailPrefix - Email Prefix for template
 * @property {String} defaultSubjectTemplate - default subject template
 * @property {String} defaultBodyTemplate - default body template
 * @property {String} subjectTemplate - User added subject template
 * @property {String} bodyTemplate - User added body template
 * @property {Array} templateVariables - variables available for template
 * @property {Boolean} notAnAutomatedEmail - Mark if an automatic email
 * @property {String} _subjectTemplate - Subject template to revert to
 * @property {String} _bodyTemplate - Body template to revert to
 * @property {Boolean} isDefaultBodyTemplate - Marks if the original body template
 * @property {Boolean} isDefaultSubjectTemplate - Marks if the original subject template
 * @property {Array} _selectionPositionHistory - Gives all history of email selection
 */
export default class EmailTemplate extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      emailPrefix: { type: String },
      defaultSubjectTemplate: { type: String },
      defaultBodyTemplate: { type: String },
      subjectTemplate: { type: String },
      bodyTemplate: { type: String },
      templateVariables: { type: Array },
      notAnAutomatedEmail: { type: Boolean },
      _subjectTemplate: { state: true },
      _bodyTemplate: { state: true },
      isDefaultBodyTemplate: { state: true },
      isDefaultSubjectTemplate: { state: true },
      _selectionPositionHistory: { state: true }
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.defaultSubjectTemplate = '';
    this.defaultBodyTemplate = '';
    this.subjectTemplate = '';
    this.bodyTemplate = '';
    this.templateVariables = [];
    this._subjectTemplate = '';
    this._bodyTemplate = '';
    this.isDefaultBodyTemplate = false;
    this.isDefaultSubjectTemplate = false;
    this.notAnAutomatedEmail = false;
    this.emailPrefix = '';
    this._selectionPositionHistory = [];
    this._selectionPositionHistoryMax = 10;
  }

  /**
   * @description Lit lifecycle method callback
   * @param {Map} props - changed properties
   */
  willUpdate(props) {
    if ( props.has('subjectTemplate') || props.has('defaultSubjectTemplate') ) {
      this._subjectTemplate = this.subjectTemplate || this.defaultSubjectTemplate;
    }
    if ( props.has('bodyTemplate') || props.has('defaultBodyTemplate') ) {
      this._bodyTemplate = this.bodyTemplate || this.defaultBodyTemplate;
    }
    if ( props.has('_bodyTemplate') ) {
      this.isDefaultBodyTemplate = this._bodyTemplate.trim() === this.defaultBodyTemplate.trim();
    }
    if ( props.has('_subjectTemplate') ) {
      this.isDefaultSubjectTemplate = this._subjectTemplate.trim() === this.defaultSubjectTemplate.trim();
    }
  }

  /**
   * @description focus the changes on the template
   * @param {e} e - e
   */
  _onTemplateFocus(e) {
    const template = e.target.getAttribute('email-template');
    if ( !template ) return;
    const selectionStart = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;
    this._selectionPositionHistory.push({ template, selectionStart, selectionEnd });
    if ( this._selectionPositionHistory.length > this._selectionPositionHistoryMax ) {
      this._selectionPositionHistory.shift();
    }
  }

  /**
   * @description Inputs the new value in the form
   * @param {String} template - type of template
   * @param {String} newValue - new value entered
   */
  async _onFormInput(template, newValue){
    this[template] = newValue;
    await this.updateComplete;
    this.dispatchUpdateEvent();
  }

  /**
   * @description reverts the template back to original
   * @param {String} template - type of template
   */
  _onTemplateRevert(template){
    if ( template === 'subject' ) {
      this._onFormInput('_subjectTemplate', this.defaultSubjectTemplate);
    } else {
      this._onFormInput('_bodyTemplate', this.defaultBodyTemplate);
    }
  }

/**
   * @description Selects the variables that are available 
   * @param {e} props - e
   */
  _onVariableSelect(e){
    if ( !e.target.value ) return;
    const v = `\${${e.target.value}\}`;
    let position;
    if ( this._selectionPositionHistory.length ) {
      position = this._selectionPositionHistory[this._selectionPositionHistory.length-1];
    } else {
      position = { selectionStart: 0, selectionEnd: 0, template: 'subject' };
    }
    const template = position.template === 'subject' ? '_subjectTemplate' : '_bodyTemplate';
    const value = this[template];
    const newValue = value.substring(0, position.selectionStart) + v + value.substring(position.selectionEnd);
    this._onFormInput(template, newValue);

    // return focus to input and set cursor position
    const ele = this.renderRoot.querySelector(`input[email-template=${position.template}]`);
    ele.focus();
    setTimeout(() => {
      ele.setSelectionRange(position.selectionStart + v.length, position.selectionStart + v.length);
    }, 100);

    // reset variable select
    e.target.value = '';

  }

  /**
   * @description dispatches the update for the email
   */
  dispatchUpdateEvent() {
    this.dispatchEvent(new CustomEvent('email-update', {
      bubbles: true,
      composed: true,
      detail: {
        emailPrefix: this.emailPrefix,
        subjectTemplate: this.isDefaultSubjectTemplate ? '' : this._subjectTemplate,
        bodyTemplate: this.isDefaultBodyTemplate ? '' : this._bodyTemplate,
        isSubjectDefault: this.isDefaultSubjectTemplate,
        isBodyDefault: this.isDefaultBodyTemplate
      }
    }));
  }

}

customElements.define('email-template', EmailTemplate);