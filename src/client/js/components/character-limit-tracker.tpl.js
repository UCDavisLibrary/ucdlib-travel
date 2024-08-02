import { html, css } from 'lit';

export function render() {
  return html`
    <style>
      .character-limit-tracker {
        color: ${this.color};
      }
    </style>
    <div 
      class="character-limit-tracker"
      .value=${this.value} 
    >${this.message}</div>
  `;
}
