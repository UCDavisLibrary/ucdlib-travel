import { html } from 'lit';

/**
 * @description Main render function for this component
 * @returns {TemplateResult}
 */
export function render() {
  return html`
    ${renderField('Comments', this.input, 'None')}
  `;}

function renderField(value,characterLimit=0,warningThreshold=0) {
  return html`
    <div 
      .value=${this.input} 
      .characterLimit=500
      .warningThreshold=90 <!-- If want custom threshold -->>
    ><span style="color: ${this.color}">${this.message}</span></div>
  `;
}
