import { html } from 'lit';

/**
 * @class ValidationHandler
 * @description Class to handle validation error objects from the server
 * @param {Object} corkError - Error object from a cork-app-utils event
 */
export default class ValidationHandler {

  constructor(corkError={}) {
    this.init(corkError);
    this._errorClass = 'field-error';
    this._errorMessageClass = 'field-error-message';
  }

  /**
   * @description Initialize the ValidationHandler with a corkError object
   * @param {Object} corkError - Error object from a cork-app-utils event
   */
  init(corkError={}){
    this.corkError = corkError;
    this.errorsByField = (corkError?.error?.payload?.fieldsWithErrors || []).reduce((acc, error) => {
      acc[error.jsonName] = error.errors || [];
      return acc;
    }
    , {});

  }

  /**
   * @description Get the error class (if any) for a field
   */
  errorClass(field){
    return this.errorsByField[field] ? this._errorClass : '';
  }

  /**
   * @description Render error messages for a field (if any)
   */
  renderErrorMessages(field){
    const messages = this.errorsByField[field] || [];
    return html`
      <div class=${this._errorMessageClass}>
        ${messages.map(err => html`<div>${err.message}</div>`)}
      </div>
    `
  }

  /**
   * @description Get the error object for a field and error type
   * @param {String} field - field name
   * @param {String} errorType - error type set by the server
   * @returns {Object|undefined}
   */
  getError(field, errorType){
    return this.errorsByField[field] && this.errorsByField[field].find(e => e.errorType === errorType);
  }

}
