import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() {
return html`
  <div class='l-gutter'>
    <p>${unsafeHTML(this.SettingsModel.getByKey('admin_line_items_description'))}</p>
    <div>
      ${this.lineItems.map(item => {
        if ( item.editing ) return renderLineItemForm.call(this, item);
        return renderLineItem.call(this, item);
      })}
    </div>
  </div>
`;}

function renderLineItem(item) {
  return html`
    <div class='line-item'>
      <div class='line-item__header'>
        <h3>${item.label}</h3>
        <a title='Edit line item' class='icon-link'><i class="wonder-blue fa-solid fa-pen-to-square"></i></a>
        <a title='Delete line item' class='icon-link double-decker'><i class="fa-solid fa-trash-can"></i></a>
      </div>
    </div>
  `
}

function renderLineItemForm(item) {
  return html`<p>i am a line item form</p>
  `
}
