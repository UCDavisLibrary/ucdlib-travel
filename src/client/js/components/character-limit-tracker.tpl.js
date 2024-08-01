import { html } from 'lit';

/**
 * @description Main render function for this component
 * @returns {TemplateResult}
 */
export function render() {
  return html`
    <div 
      .value=${this.value} 
      .characterLimit=${this.characterLimit || 500}
      .warningThreshold=${this.warningThreshold || 100}
    ><span style="color: ${this.color}">${this.message}</span></div>
  `;
}
