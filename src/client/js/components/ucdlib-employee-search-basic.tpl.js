import { html } from 'lit';

/**
 * @description Main render function for this element
 * @returns {TemplateResult}
 */
export function render() {
return html`
<div>
<div>
  <div class="field-container emp-search-top">
    <label ?hidden=${this.hideLabel}>Employee(s)*</label>
    <div class='emp-search-bar'>
      <input
        @input=${this._onInput}
        @focus=${() => this.isFocused = true}
        @blur=${() => this._onBlur()}
        .value=${this.selectedText || this.query || this.selectedValue}
        placeholder=${this.labelText}
        type="text">
        <div class='emp-search-icon'>
          ${renderInputIcon.call(this)}
        </div>
    </div>
  </div>
</div>
<div class='emp-search-results-parent'>
  <div class='emp-search-results' ?hidden=${!this.showDropdown}>
    <div>
    ${this.results.map(result => html`
      <div class='emp-search-result pointer' @click=${() => this._onSelect(result, true)}>
        <div>${result.first_name} ${result.last_name}</div>
        <div class='muted'>${result.title}, ${this.getDepartment(result)}</div>
      </div>
    `)}
    </div>
    <div class='muted emp-search-more' ?hidden=${!this.resultCtNotShown}>
      And ${this.resultCtNotShown} more employees... <br> Try refining your search.
    </div>
  </div>
</div>
<div class='brand-textbox u-space-mt--small' ?hidden=${this.status != 'no-results' || !this.isFocused }>No results matched your search!</div>
<div class='brand-textbox u-space-mt--small category-brand--redbud' ?hidden=${!this.iamRecordMissing}>Employee is not in Library directory system!</div>
</div>
`;}

/**
 * @description Render the icon in the input field
 * @returns {TemplateResult}
 */
function renderInputIcon(){
  if ( this.error || this.status === 'no-results' ) return html`<i class="fas fa-exclamation double-decker"></i>`;
  if ( this.status === 'searching' ) return html`<i class="fas fa-circle-notch fa-spin"></i>`;
  if ( this.status === 'selected' ) return html`<i class="fas fa-solid fa-user"></i>`;
  return html`<i class='fas fa-regular fa-user'></i>`;
}
