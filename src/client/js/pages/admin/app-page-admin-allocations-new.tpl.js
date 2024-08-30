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
        <div class="field-container ${this.validationHandler.errorClass('startDate')}">
          <label for="${page}--from">Fiscal Year <abbr title="Required">*</abbr></label>
          <select @input=${(e) => this._setFiscalYear(e.target.value)} .value=${this._selectedFiscalYear.startYear}>
            ${this._fiscalYears.map(fiscalYear => html`
              <option
                value=${fiscalYear.startYear}
                ?selected=${this._selectedFiscalYear.startYear === fiscalYear.startYear}
                >
                ${fiscalYear.label}
              </option>
              `)}
          </select>
        </div>
        <div class="l-2col" hidden>
          <div class="l-first">
            <div class="field-container ${this.validationHandler.errorClass('startDate')}">
              <label for="${page}--from">From <abbr title="Required">*</abbr></label>
              <input
                type="date"
                .value=${this.startDate}
                id="${page}--from"
                @change=${e => this._onFormInput('startDate', e.target.value)}
                >
                <div>${this.validationHandler.renderErrorMessages('startDate')}</div>
            </div>
          </div>
          <div class="l-second">
            <div class="field-container ${this.validationHandler.errorClass('endDate')}">
              <label for="${page}--to">To <abbr title="Required">*</abbr></label>
              <input
                type="date"
                .value=${this.endDate}
                id="${page}--to"
                @change=${e => this._onFormInput('endDate', e.target.value)}
                >
                <div>${this.validationHandler.renderErrorMessages('endDate')}</div>
            </div>
          </div>
        </div>
        <div class="l-2col u-space-mt--large">
          <div class="l-first">
            <div class="field-container ${this.validationHandler.errorClass('fundingSourceId')}">
              <label for="${page}--funding-source">Funding Source <abbr title="Required">*</abbr></label>
              <select
                id="${page}--funding-source"
                @change=${e => this._onFundingSourceSelect(e.target.value)}
                .value=${this.selectedFundingSource?.fundingSourceId || ''}
                >
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
              <div>${this.validationHandler.renderErrorMessages('fundingSourceId')}</div>
            </div>
          </div>
          <div class="l-second">
            <div class="field-container ${this.validationHandler.errorClass('amount')}">
              <label for="${page}--funding-amount">Amount <abbr title="Required">*</abbr></label>
              <input
                type="number"
                id="${page}--funding-amount"
                .value=${this.fundingAmount}
                @change=${e => this._onFormInput('fundingAmount', e.target.value)}
                >
            </div>
            <div>${this.validationHandler.renderErrorMessages('amount')}</div>
          </div>
        </div>
      </fieldset>
      <fieldset class='${this.validationHandler.errorClass('employees')}'>
        <legend>Employees</legend>
        <div>${this.validationHandler.renderErrorMessages('employees')}</div>
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
            <div class="l-2col employee-list--item ${this.employeeAlreadyHasAllocation(employee) ? 'already-exists' : ''}">
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
      <button type="submit" class='btn btn--primary u-space-mr u-space-mt'>Add New Allocations</button>
      <button type="button" @click=${this._onCancel} class='btn btn--alt3 u-space-mt'>Cancel</button>
    </form>
    `;
  }
