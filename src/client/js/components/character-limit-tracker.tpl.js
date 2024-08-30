import { html } from 'lit';

export function render() {
  return html`
    <div 
      class=${this.className}
      .value=${this.value} 
    >${this.message}</div>
  `;
}