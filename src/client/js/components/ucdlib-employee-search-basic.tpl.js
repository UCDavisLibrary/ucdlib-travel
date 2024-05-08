import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
    ucdlib-employee-search-basic {
      max-width: 500px;
      margin: auto;
      display: block
  }
  
  ucdlib-employee-search-basic .emp-search-top.field-container {
      margin-bottom: 0
  }
  
  ucdlib-employee-search-basic .emp-search-bar {
      position: relative
  }
  
  ucdlib-employee-search-basic .emp-search-bar input {
      flex-grow: 1;
      padding-right: 2rem
  }
  
  ucdlib-employee-search-basic .emp-search-bar .emp-search-icon {
      position: absolute;
      width: 2.5rem;
      min-width: 2.5rem;
      height: 2.5rem;
      min-height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      right: 0;
      top: 0;
      color: #022851
  }
  
  ucdlib-employee-search-basic .emp-search-results-parent {
      position: relative
  }
  
  ucdlib-employee-search-basic .emp-search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 100;
      background-color: #fffbed;
      border-right: 1px solid #ffbf00;
      border-left: 1px solid #ffbf00;
      border-bottom: 1px solid #ffbf00;
      color: #13639e;
      max-height: 250px;
      overflow-y: scroll
  }
  
  ucdlib-employee-search-basic .emp-search-results .emp-search-result {
      padding: .5rem .75rem
  }
  
  ucdlib-employee-search-basic .emp-search-results .emp-search-result:hover {
      background-color: #fde9ac
  }
  
  ucdlib-employee-search-basic .emp-search-results .highlight {
      font-weight: 700
  }
  
  ucdlib-employee-search-basic .emp-search-results .muted {
      font-weight: 400;
      color: #545454
  }
  
  ucdlib-employee-search-basic .emp-search-results .emp-search-more {
      padding: .5rem .75rem
  }
  `;

  return [elementStyles];
}

export function render() {
return html`
<div>
<div>
  <div class="field-container emp-search-top">
    <label ?hidden=${this.hideLabel}>${this.labelText}</label>
    <div class='emp-search-bar'>
      <input
        @input=${(e) => this.query = e.target.value}
        @focus=${() => this.isFocused = true}
        @blur=${() => this._onBlur()}
        .value=${this.selectedText ? this.selectedText : this.query}
        placeholder=${this.labelText}
        type="text">
        <div class='emp-search-icon'>
          <div ?hidden=${this.status != 'idle'} >
            <i class='fas fa-regular fa-user'></i>
          </div>
          <div ?hidden=${this.status != 'searching'}>
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <div ?hidden=${this.status != 'no-results'}>
            <i class="fas fa-exclamation double-decker"></i>
          </div>
          <div ?hidden=${this.status != 'selected'}>
            <i class="fas fa-solid fa-user"></i>
          </div>
        </div>
    </div>
  </div>
</div>
<div class='emp-search-results-parent'>
  <div class='emp-search-results' ?hidden=${!this.showDropdown}>
    <div>
    ${this.results.map(result => html`
      <div class='emp-search-result pointer' @click=${() => this._onSelect(result)}>
        ${this._renderResult(result)}
      </div>
    `)}
    </div>
    <div class='muted emp-search-more' ?hidden=${!this.resultCtNotShown}>
      And ${this.resultCtNotShown} more employees... <br> Try refining your search.
    </div>
  </div>
</div>
<div class='brand-textbox u-space-mt--small' ?hidden=${this.status != 'no-results' || !this.isFocused }>No results matched your search!</div>
</div>
`;}
