import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() {
return html`
  <div class='l-gutter u-space-mb--large'>
    <p>${unsafeHTML(this.SettingsModel.getByKey('admin_line_items_description'))}</p>
    <div>
      ${this.lineItems.map(item => {
        if ( item.editing ) return renderLineItemForm.call(this, item);
        return renderLineItem.call(this, item);
      })}
    </div>
    <div>
      <div ?hidden=${!this.showNewLineItemForm} class='new-line-item-form'>
        ${renderLineItemForm.call(this, this.newLineItem)}
      </div>
      <button 
        @click=${this._onNewClick} 
        ?disabled=${this.showNewLineItemForm}
        class='btn btn--primary'>Add New Line Item Option</button>
    </div>
  </div>
`;}

function renderLineItem(item) {
  return html`
    <div class='line-item'>
      <div class='line-item__header'>
        <h3>${item.label}</h3>
        <a
          title='Edit line item'
          @click=${e => this._onEditClick(item)}
          class='icon-link'><i class="wonder-blue fa-solid fa-pen-to-square"></i></a>
        <a 
          title='Delete line item' 
          @click=${e => this._onDeleteClick(item)}
          class='icon-link double-decker'>
          <i class="fa-solid fa-trash-can"></i></a>
      </div>
      <div>
        <div class='bold primary'>Description</div>
        <div>${item.description ? unsafeHTML(item.description) : 'None'}</div>
      </div>
    </div>
  `
}

function renderLineItemForm(item) {
  if ( !item || Object.keys(item).length === 0 ) return html``;
  const itemId = item.expenditureOptionId || 'new';
  const inputIdLabel = `line-item-label-${itemId}`;
  const inputIdDescription = `line-item-description-${itemId}`;
  const inputIdOrder = `line-item-order-${itemId}`;

  return html`
    <form line-item-id=${item.expenditureOptionId} class='line-item-form' @submit=${this._onFormSubmit}>
      ${itemId === 'new' ? html`<h3>New Line Item</h3>` : html`<h3>Edit Line Item</h3>`}
      <div class='field-container ${item.validationHandler.errorClass('label')}'>
        <label for=${inputIdLabel}>Label <abbr title="Required">*</abbr></label>
        <input id=${inputIdLabel} type='text' value=${item.label} @input=${e => this._onFormInput('label', e.target.value, item)}>
        ${item.validationHandler.renderErrorMessages('label')}
      </div>
      <div class='field-container ${item.validationHandler.errorClass('formOrder')}'>
        <label for=${inputIdOrder}>Form Order</label>
        <input id=${inputIdOrder} type='number' value=${item.formOrder} @input=${e => this._onFormInput('formOrder', e.target.value, item)}>
        <div class='field-help'>${this.SettingsModel.getByKey('admin_line_items_form_order_help')}</div>
        ${item.validationHandler.renderErrorMessages('formOrder')}
      </div>
      <div class='field-container'>
        <label for=${inputIdDescription}>Description</label>
        <textarea
          id=${inputIdDescription}
          rows='4'
          @input=${e => this._onFormInput('description', e.target.value, item)}
          .value=${item.description}
          ></textarea>
      </div>

      <div class='buttons'>
        <button type='submit' class='btn btn--alt3'>Save</button>
        <button @click=${e => this._onEditCancelClick(item)} type='button' class='btn btn--alt3'>Cancel</button>
      </div>

    </form>
    `
}
