import { html, css } from 'lit';

export function render() {
return html`
<div>
<div>
  <div class="field-container emp-search-top">
    <label ?hidden=${this.hideLabel}>Employee(s)*</label>
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
        ${renderResult(result)}
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

/**
 * @description Renders a single result item in the results dropdown
 * @param {Object} result - an Employee object from the database
 * @returns {TemplateResult}
 */
function renderResult(result){
  let name = `${result.first_name} ${result.last_name}`.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let department = getDepartment(result);
  return html`
    <div>${name}</div>
    <div class='muted'>${result.title}, ${department}</div>
  `;
}

     /**
     * @description searches for employee department
     * @param {Object} result - an Employee object from the database
     */
    // if item in results.group has key of type === 'Department', then return the name value of that object
    function getDepartment(result){
      if ( result.groups ) {
        let department = result.groups.find(group => group.type === 'Department');
        console.log(department);
        if ( department ) return department.name;
      }
      return '';
    }