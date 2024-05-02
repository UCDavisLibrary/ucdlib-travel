import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ref } from 'lit/directives/ref.js';

export function render() { 
return html`
  <dialog ${ref(this.dialogRef)}>
    <div>
      <h2 ?hidden=${!this.modalTitle} class='heading--highlight'>${this.modalTitle}</h2>
    </div>
    <div>
      ${unsafeHTML(this.modalContent)}
    </div>
    <div class='alignable-promo__buttons'>
      ${this.actions.map(action => html`
        <div class=${action.color ? 'category-brand--' + action.color : ''}>
          <button 
            @click=${e => this._onButtonClick(action.value)} 
            class='btn btn--${action.invert ? 'invert' : 'primary'}'>${action.text}
          </button>
        </div>
      `)}
    </div>
  </dialog>
`;}