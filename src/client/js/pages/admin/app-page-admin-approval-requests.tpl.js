import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';

import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js'
import "../../components/approval-request-teaser.js";
import "../../components/approval-request-draft-list.js";

export function render() {
return html`
  <div class='l-gutter l-basic--flipped'>
    <div class='l-content'>
          ${renderFilters.call(this)}
      <div ?hidden=${!this.approvalRequests.length}>
        ${this.approvalRequests.map(request => html`
          <div class='approval-request-teaser-wrapper'>
            <approval-request-teaser
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

      <div ?hidden=${this.approvalRequests.length}>
        <div class='flex flex--align-center'>
          <i class='fa-solid fa-circle-exclamation fa-2x admin-blue'></i>
          <div class='u-space-ml--small'>There are no approval requests.</div>
        </div>
      </div>
    </div>
    <div class='l-sidebar-first'>
    <approval-request-draft-list
      ${ref(this.draftListSelectRef)}
    ></approval-request-draft-list>

    </div>

  </div>

`;}

/**
 * @description Render the filters for the allocations page
 */
function renderFilters() {
  return html`
    <div class='allocations-filters l-3col'>
      <div class='l-first'>
        <div class='field-container'>
          <label>Approval Request State</label>
          <ucd-theme-slim-select @change=${e => this._onFilterChange(e.detail, 'selectedApprovalRequestFilters')}>
            <select multiple>
              ${this.approvalStatusFilters.map(application => html`
                <option
                  value=${application.kerberos}
                  ?selected=${this.selectedApprovalRequestFilters.includes(application.approvalStatus)}
                  >${application.approvalStatus}
                </option>
              `)}
            </select>
          </ucd-theme-slim-select>
        </div>
      </div>
    </div>
  `;
}