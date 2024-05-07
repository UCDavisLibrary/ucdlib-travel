import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';

import "../../components/ucdlib-employee-search-advanced.js";

export function render() {

  return html`
  <div class='l-gutter u-space-mb--large'>
    <div class='l-basic--flipped'>
      <div class ='l-content'>
        ${renderForm.call(this)}
      </div>
      <div class='l-sidebar-second'>
      <div class="panel panel--icon panel--icon-custom panel--icon-secondary">
        <h2 class="panel__title"><span class="panel__custom-icon fa-solid fa-magnifying-glass"></span>Search Library Employees</h2>
        <section>
          <ucdlib-employee-search-advanced
            ${ref(this.employeeSearchRef)}
            .selectButtonText=${'Add to Allocation List'}
            @employee-select=${this._onEmployeeSelect}
            .clearOnSelectConfirmation=${true}>
          </ucdlib-employee-search-advanced>
        </section>
      </div>
      </div>
    </div>
  </div>
  `;}

  function renderForm(){
    const page = 'app-page-admin-allocations-new';

    return html`
    <form @submit=${this._onFormSubmit}>
      <fieldset>
        <legend>Allocation</legend>
        <div class="l-2col">
          <div class="l-first">
            <div class="field-container">
              <label for="${page}--from">From <abbr title="Required">*</abbr></label>
              <input
                type="date"
                id="${page}--from"
                @change=${e => this._onFormInput('startDate', e.target.value)}
                >
            </div>
          </div>
          <div class="l-second">
            <div class="field-container">
              <label for="${page}--to">To <abbr title="Required">*</abbr></label>
              <input
                type="date"
                id="${page}--to"
                @change=${e => this._onFormInput('endDate', e.target.value)}
                >
            </div>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Employees</legend>
        <div ?hidden=${this.employees.length > 0}>
          <p>No employees selected. Use search form to add employees to this list.</p>
        </div>
        <div ?hidden=${!this.employees.length} class='employee-list'>
          <div class="l-2col employee-list--header">
            <div class="l-first flex">
              <div class='x-container'></div>
              <div>Name</div>
            </div>
            <div class="l-second">Department</div>
          </div>
          ${this.employees.map(employee => html`
            <div class="l-2col employee-list--item">
              <div class="l-first flex">
                <div class='x-container'>
                  <a
                  title='Remove employee'
                  @click=${e => this._onRemoveEmployee(employee)}
                  class='icon-link'><i class="double-decker fa-solid fa-xmark"></i></a>
                </div>
                <div class='name'>${employee.firstName} ${employee.lastName}</div>
              </div>
              <div class="l-second flex">
                <div class='x-container'></div>
                <div>${employee?.department?.label || ''}</div>
              </div>
            </div>
          `)}
        </div>
      </fieldset>
      <button type="submit" class='btn btn--primary'>Add Allocations</button>
    </form>
    `;
  }
