import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';


export function render() { 
    return html`
    <div class="comment-container"  @click=${e => this._onModalClick(e)}> 
        <div class='icon-circle category-brand--delta category-brand__background'>
            <i class="fa fa-question"></i>
        </div>
        <div class='content'>Questions or Comments</div>
    </div>

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



