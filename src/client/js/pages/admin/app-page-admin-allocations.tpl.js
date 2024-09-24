import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js'
import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js'

import fiscalYearUtils from '../../../../lib/utils/fiscalYearUtils.js';

/**
 * @description Main render function for this element
 */
export function render() {
return html`
<div class='l-gutter u-space-mb--large'>
  <div class='l-basic--flipped'>
    <div class ='l-content'>
      ${renderFilters.call(this)}
      <div class='allocation-results'>
        <div ?hidden=${this.queryState !== 'loaded'}>${this.results.map(result => renderAllocationItem.call(this, result))}</div>
        <div ?hidden=${this.queryState !== 'loading'} class='flex flex--justify-center'>
          <i class="fa-solid fa-circle-notch fa-spin primary fa-2x"></i>
        </div>
        <div ?hidden=${this.queryState !== 'no-results'} class='alert flex'>
          <i class="fa-solid fa-circle-exclamation pad-icon-top"></i>
          <span class='u-space-ml--small'>No allocations match the applied filters.</span>
        </div>
        <ucd-theme-pagination
          max-pages=${this.maxPage}
          current-page=${this.page}
          @page-change=${this._onPageChange}>
        </ucd-theme-pagination>
      </div>
    </div>
    <div class='l-sidebar-second'>
      <a href=${this.AppStateModel.store.breadcrumbs['admin-allocations-new'].link} class="focal-link u-space-mb category-brand--quad">
        <div class="focal-link__figure focal-link__icon">
          <i class="fas fa-plus fa-2x"></i>
        </div>
        <div class="focal-link__body">
          <strong>Add Allocations</strong>
        </div>
      </a>
    </div>
  </div>
</div>
${renderEditFormModal.call(this)}
`;}

/**
 * @description Render the modal for editing an allocation
 * @returns {TemplateResult}
 */
function renderEditFormModal() {
  return html`
  <dialog ${ref(this.editDialogRef)}>
    <form @submit=${this._onEditSubmit}>
      <div class='u-space-mb'><h4>Edit Allocation</h4></div>
      <div>
        <div class='u-space-mb--small'>
          <div class='bold primary'>Employee</div>
          <div>${this.selectedAllocation?.employee?.firstName} ${this.selectedAllocation?.employee?.lastName}</div>
        </div>
        <div class='u-space-mb--small'>
          <div class='bold primary'>Funding Source</div>
          <div>${this.selectedAllocation?.fundingSourceLabel}</div>
        </div>
        <div class='u-space-mb--small'>
          <div class='bold primary'>Fiscal Year</div>
          <div>${fiscalYearUtils.fromDate(this.selectedAllocation?.startDate)}</div>
        </div>
        <div class='field-container ${this.validationHandler.errorClass('amount')}'>
          <label for='${this.id}--amount'>Amount <abbr title='Required'>*</abbr></label>
          <input
            type='number'
            id='${this.id}--amount'
            .value=${this.selectedAllocation?.amount}
            step='0.01'
            @input=${e => this.setSelectedAllocationProperty('amount', Number(e.target.value))}>
          <div>${this.validationHandler.renderErrorMessages('amount')}</div>
        </div>
        <div class='field-container ${this.validationHandler.errorClass('departmentId')}'>
          <label for='${this.id}--department'>Department</label>
          <select
            id='${this.id}--department'
            .value=${this.selectedAllocation?.departmentId}
            @change=${e => this.setSelectedAllocationProperty('departmentId', Number(e.target.value))}>
            <optgroup label='Active Departments'>
              ${this.allDepartments.filter(d => !d.archived).map(department => html`
                <option value=${department.departmentId} ?selected=${department.departmentId == this.selectedAllocation?.departmentId}>${department.label}</option>
                `)}
            </optgroup>
            <optgroup label='Archived Departments' ?hidden=${!this.allDepartments.filter(d => d.archived).length}>
              ${this.allDepartments.filter(d => d.archived).map(department => html`
                <option value=${department.departmentId} ?selected=${department.departmentId == this.selectedAllocation?.departmentId}>${department.label}</option>
                `)}
              </optgroup>
          </select>
          <div>${this.validationHandler.renderErrorMessages('departmentId')}</div>
        </div>

      </div>
      <div class='alignable-promo__buttons u-space-mt flex flex--wrap'>
        <div class='category-brand--secondary'>
          <button
            class='btn btn--primary'
            ?disabled=${this.updateInProgress}
            type='submit'>
            <span ?hidden=${!this.updateInProgress} class='u-space-mr--small'><i class='fas fa-circle-notch fa-spin'></i></span>
            <span>Update</span>
          </button>
        </div>
        <div class='category-brand--secondary'>
          <button
            class='btn btn--invert'
            @disabled=${this.updateInProgress}
            type='button'
            @click=${() => this.editDialogRef.value.close()} >
            Cancel
          </button>
        </div>
      </div>
    </form>
  </dialog>
  `;
}

/**
 * @description Render the filters for the allocations page
 */
function renderFilters() {
  return html`
    <div class='allocations-filters l-3col'>
      <div class='l-first container-type--normal'>
        <div class='field-container'>
          <label>Fiscal Year</label>
          <ucd-theme-slim-select @change=${e => this._onFilterChange(e.detail, 'selectedFiscalYearFilters', true)}>
            <select multiple>
              ${this.fiscalYearFilters.map(fy => html`
                <option
                  value=${fy.startYear}
                  ?selected=${this.selectedFiscalYearFilters.includes(fy.startYear)}
                  >${fy.label}
                </option>
              `)}
            </select>
          </ucd-theme-slim-select>
        </div>
      </div>
      <div class='l-second container-type--normal'>
        <div class='field-container'>
          <label>Employee</label>
          <ucd-theme-slim-select @change=${e => this._onFilterChange(e.detail, 'selectedEmployeeFilters')}>
            <select multiple>
              ${this.employeeFilters.map(employee => html`
                <option
                  value=${employee.kerberos}
                  ?selected=${this.selectedEmployeeFilters.includes(employee.kerberos)}
                  >${employee.firstName} ${employee.lastName}
                </option>
              `)}
            </select>
          </ucd-theme-slim-select>
        </div>
      </div>
      <div class='l-third container-type--normal'>
        <div class='field-container'>
          <label>Funding Source</label>
          <ucd-theme-slim-select @change=${e => this._onFilterChange(e.detail, 'selectedFundingSourceFilters', true)}>
            <select multiple>
              ${this.fundingSourceFilters.map(fs => html`
                <option
                  value=${fs.fundingSourceId}
                  ?selected=${this.selectedFundingSourceFilters.includes(fs.fundingSourceId)}
                  >${fs.label}
                </option>
              `)}
            </select>
          </ucd-theme-slim-select>
        </div>
      </div>
    </div>
  `;
}

/**
 * @description Render an individual allocation item
 */
function renderAllocationItem(allocation) {
  return html`
    <div class='allocation-item'>
      <div class='allocation-delete u-space-mr'>
        <a
          title='Delete allocation'
          @click=${() => this._onDeleteClick(allocation)}
          class='icon-link double-decker u-space-mr--small'>
          <i class="fa-solid fa-trash-can"></i>
        </a>
        <a
          title='Edit allocation'
          @click=${() => this._onEditClick(allocation)}
          class='icon-link'>
          <i class="fa-solid fa-pen"></i>
        </a>
      </div>
      <div class='allocation-details'>
        <h5>${allocation.employee.firstName} ${allocation.employee.lastName}</h5>
        <div class='primary bold'>${allocation.fundingSourceLabel}</div>
        <div hidden>From: ${allocation.startDate}</div>
        <div hidden>To: ${allocation.endDate}</div>
        <div>Fiscal Year: ${fiscalYearUtils.fromDate(allocation.startDate)}</div>
        <div>Department: ${allocation.department?.label || ''}</div>
        <div class='allocation-amount__mobile'>Amount: $${allocation.amount}</div>
      </div>
      <div class='allocation-amount__desktop u-space-ml'>$${allocation.amount}</div>

    </div>
  `;
}
