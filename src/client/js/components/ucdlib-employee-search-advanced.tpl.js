import { html } from 'lit';
import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js'

/**
 * @description Main render function for this element
 * @returns {TemplateResult}
 */
export function render() {
  if ( this._initialized == 'error' ) {
    return html`
    <div class="alert alert--error">
      An error occurred while loading the employee search form. Please try again later.
    </div>
    `;
  } else if ( this._initialized == 'loading' ) {
    return html`
      <p>Loading...</p>
    `;
  } else if ( this._initialized ) {
    return html`
      <div>
        ${renderForm.call(this)}
        ${this._error ? html`
          <div class="alert alert--error">
            An error occurred while searching the Library personnel database. Please try again.
          </div>
        ` : renderResults.call(this)}
      </div>
    `;
  }
}

/**
 * @description Render the form for the advanced employee search
 * @returns {TemplateResult}
 */
function renderForm(){
  return html`
    <form @submit=${this._onFormSubmit}>
      <div class='field-container'>
        <label>Employee Name</label>
        <input
          type='text'
          .value=${this.employeeName}
          @input=${e => this.employeeName = e.target.value}>
      </div>
      <div class='field-container' ?hidden=${!this.departments.length}>
        <label>Department</label>
        <ucd-theme-slim-select
          @change=${e => this.selectedDepartments = e.detail.map(option => parseInt(option.value))}>
          <select multiple>
            ${this.departments.map(department => html`
              <option
                value=${department.id}
                ?selected=${this.selectedDepartments.includes(department.id)}
                >${department.name}
              </option>
            `)}
          </select>
        </ucd-theme-slim-select>
      </div>
      <div class='field-container' ?hidden=${!this.titleCodes.length}>
        <label>Title Code</label>
        <ucd-theme-slim-select
          @change=${e => this.selectedTitleCodes = e.detail.map(option => option.value)}>
          <select multiple>
            ${this.titleCodes.map(titleCode => html`
              <option
                value=${titleCode.titleCode}
                ?selected=${this.selectedTitleCodes.includes(titleCode.titleCode)}
                >${titleCode.titleDisplayName}
              </option>
            `)}
          </select>
        </ucd-theme-slim-select>
      </div>
      <button class='btn btn--alt3 btn--block' type='submit' ?disabled=${this._formDisabled}>
        ${this._searching ? html`
          <span class='fa-solid fa-spinner fa-spin'></span><span class='u-space-ml--small'>Searching</span>`
          : html`
            <span>Search</span>`}
      </button>
    </form>
  `;
}

function renderResults(){
  if ( !this._didSearch ) {
    return html``;
  }
  if ( !this.results.length ) {
    return html`
      <div class='alert alert--info u-space-px'>
        No results found.
      </div>
    `;
  }

  const selectAllId = Math.random().toString(36).substring(7);
  return html`
    <div>
      <div class='results-header'>
        <div class='checkbox'>
          <input
            id=${selectAllId}
            type='checkbox'
            .checked=${this._allSelected}
            @change=${this._onSelectAllToggle}>
          <label for=${selectAllId}>Select All</label>
        </div>
      </div>
      <div class='results-body'>
        ${this.results.map(employee => html`
          <div class='result checkbox'>
            <input
              id=${selectAllId + '-' + employee.user_id}
              type='checkbox'
              .checked=${this._employeeIsSelected(employee)}
              @change=${e => this._onEmployeeSelectToggle(employee)}>
            <label for=${selectAllId + '-' + employee.user_id}>
              <div class='bold primary'>${employee.first_name} ${employee.last_name}</div>
              <div class='field-help'>${employee.title || ''}</div>
              <div class='field-help'>${this._getEmployeeDepartment(employee)}</div>
            </label>
          </div>
        `)}
      </div>
      <button
        class='btn btn--alt3 btn--block'
        type='button'
        @click=${this._onSelectConfirmation}
        ?disabled=${!this.selectedEmployees.length}>${this.selectButtonText} (${this.selectedEmployees.length})</button>
    </div>
  `
}
