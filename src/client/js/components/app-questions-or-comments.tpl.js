import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';


export function render() { 
    return html`
    <a @click=${e => this._onModalClick(e)} class="focal-link category-brand--delta u-space-mb">
          <div class="focal-link__figure focal-link__icon">
            <i class="fa fa-question fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <h2 class='heading--highlight'>Question and Comments</h2>
          </div>
    </a>

    <dialog ${ref(this.dialogRef)}>
        <div>
        <h2 class='heading--highlight'>Question and Comments</h2>
        </div>
        <div>
            <textarea class='comments' rows=10 cols=75 placeholder="Ask us anything...." @input=${e => this.comments = e.target.value}></textarea>
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



