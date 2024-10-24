import { html } from 'lit';

import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js'
import "../../components/approval-request-teaser.js";

export function render() {
  return html`


    <div class='l-gutter l-basic--flipped'>
      <div class='l-content'>
        ${renderFilters.call(this)}

        <div ?hidden=${!(this.approvalRequests?.length)}>
          ${this.approvalRequests.map(request => html`
            <div class='approval-request-teaser-wrapper'>
              <approval-request-teaser
                always-show-submitter
                .approvalRequest=${request}
              ></approval-request-teaser>
            </div>
          `)}
          <ucd-theme-pagination
            current-page=${this.page}
            max-pages=${this.totalPages}
            @page-change=${this._onPageChange}
            xs-screen>
          </ucd-theme-pagination>
        </div>

        <div ?hidden=${this.approvalRequests?.length}>
          <div class='flex flex--align-center'>
            <i class='fa-solid fa-circle-exclamation fa-2x admin-blue'></i>
            <div class='u-space-ml--small'>
              There are no approval requests.
            </div>
          </div>
        </div>
      </div>
      <div class='l-sidebar-first'>
        <!-- Optional sidebar content -->
      </div>
    </div>
  `;
}

/**
 * @description Render the filters for the allocations page
 */
function renderFilters() {
  return html`
    <div class='allocations-filters l-2col l-gap--1rem'>
      <div class='l-first container-type--normal'>
        <div class='field-container'>
          <label>Approval Request Status</label>
          <ucd-theme-slim-select @change=${e => this._onFilterChange(e.detail, 'selectedApprovalRequestFilters')}>
            <select multiple>
              ${this.approvalStatuses.map(s => html`
                <option
                  value=${s.value}
                  ?selected=${this.selectedApprovalRequestFilters.includes(s.value)}
                  >${s.label}
                </option>
              `)}
            </select>
          </ucd-theme-slim-select>
        </div>
      </div>
      <div class='l-second container-type--normal u-space-mt--flush'>
        <div class='field-container'>
          <label>Employee</label> <!-- Changed label to Employee -->
          <ucd-theme-slim-select @change=${e => this._onFilterChange(e.detail, 'selectedEmployeeFilters')}>
            <select multiple>
              ${(this.employeesInDB || []).map(s => html`
                <option
                  value=${s.kerberos}
                  ?selected=${this.selectedEmployeeFilters.includes(s.kerberos)}
                  >${s.firstName} ${s.lastName}
                </option>
              `)}
            </select>
          </ucd-theme-slim-select>
        </div>
      </div>
    </div>
  `;
}
