import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';

import "../../components/ucdlib-employee-search-advanced.js";

/**
 * @description Main render function
 * @returns {TemplateResult}
 */
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

/**
 * @description Render the form
 * @returns {TemplateResult}
 */
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
        <div class="l-2col u-space-mt--large">
          <div class="l-first">
            <div class="field-container">
              <label for="${page}--funding-source">Funding Source <abbr title="Required">*</abbr></label>
              <select id="${page}--funding-source" @change=${e => this._onFundingSourceSelect(e.target.value)}>
                <option value='' ?selected=${!this.selectedFundingSource?.fundingSourceId}>Select a funding source</option>
                ${this.fundingSources.map(fundingSource => html`
                  <option
                    value=${fundingSource.fundingSourceId}
                    ?disabled=${!fundingSource.hasCap}
                    ?selected=${this.selectedFundingSource?.fundingSourceId == fundingSource.fundingSourceId}>
                    ${fundingSource.label}
                  </option>
                `)}
              </select>
            </div>
          </div>
          <div class="l-second">
            <div class="field-container">
              <label for="${page}--funding-amount">Amount <abbr title="Required">*</abbr></label>
              <input
                type="number"
                id="${page}--funding-amount"
                .value=${this.fundingAmount}
                @change=${e => this._onFormInput('fundingAmount', e.target.value)}
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
      <button type="submit" class='btn btn--primary'>Add New Allocations</button>
    </form>
    `;
  }
