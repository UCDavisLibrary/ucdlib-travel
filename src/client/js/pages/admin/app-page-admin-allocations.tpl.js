import { html } from 'lit';
import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js'
import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js'

export function render() {
return html`
<div class='l-gutter u-space-mb--large'>
  <div class='l-basic--flipped'>
    <div class ='l-content'>
      <div class='allocations-filters l-3col'>
        <div class='l-first'>
          <div class='field-container'>
            <label>Date Range</label>
            <ucd-theme-slim-select @change=${e => this._onFilterChange(e.detail, 'selectedDateRangeFilters')}>
              <select multiple>
                <option value='current' ?selected=${this.selectedDateRangeFilters.includes('current')}>Current</option>
                <option value='future' ?selected=${this.selectedDateRangeFilters.includes('future')}>Future</option>
                <option value='past' ?selected=${this.selectedDateRangeFilters.includes('past')}>Past</option>
              </select>
            </ucd-theme-slim-select>
          </div>
        </div>
        <div class='l-second'>
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
        <div class='l-third'>
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
      <div class='allocation-results'>
        ${this.results.map(result => renderAllocationItem.call(this, result))}
        <ucd-theme-pagination
          .maxPage=${this.maxPage}
          .page=${this.page}
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
`;}

function renderAllocationItem(allocation) {
  return html`
    <div class='allocation-item'>
      <div></div>
      <div class='allocation-details'>
        <h5>${allocation.employee.firstName} ${allocation.employee.lastName}</h5>
        <div class='primary bold'>${allocation.fundingSourceLabel}</div>
        <div>From: ${allocation.startDate}</div>
        <div>To: ${allocation.endDate}</div>
      </div>
      <div class='allocation-amount'>$${allocation.amount}</div>

    </div>
  `;
}
