import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';

import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js'
import "../../components/approval-request-teaser.js";
import "../../components/approval-request-draft-list.js";
import "../../components/user-current-allocation-summary.js";

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
          current-page=${this.queryArgs.page}
          max-pages=${this.totalPages}
          @page-change=${this._onPageChange}
          xs-screen>
        </ucd-theme-pagination>
      </div>

      <div ?hidden=${this.approvalRequests.length}>
        <div class='flex flex--align-center'>
          <i class='fa-solid fa-circle-exclamation fa-2x admin-blue'></i>
          <div class='u-space-ml--small'>No approval requests found.</div>
        </div>
      </div>
    </div>
    <div class='l-sidebar-first'>
      <a href='/approval-request/new' class="focal-link u-space-mb category-brand--quad">
        <div class="focal-link__figure focal-link__icon">
          <i class="fas fa-plus fa-2x"></i>
        </div>
        <div class="focal-link__body">
          <strong>Submit an Approval Request</strong>
        </div>
      </a>
      <user-current-allocation-summary
        page-id=${this.id}
        ${ref(this.allocationSummaryRef)}
        >
      </user-current-allocation-summary>
      <approval-request-draft-list
        ${ref(this.draftListSelectRef)}
      ></approval-request-draft-list>

    </div>

  </div>

`;}

function renderFilters() {
  const columns = ['l-first', 'l-second u-space-mt--flush', 'l-third u-space-mt--flush'];

  // chunk this.filters into sets of 3
  const filterSets = this.filters.reduce((acc, filter, i) => {
    const index = Math.floor(i / 3);
    if ( !acc[index] ) acc[index] = [];
    acc[index].push({filter, column: columns[i % 3]});
    return acc;
  }, []);

  return html`
    <div class='u-space-mb--large'>
      ${filterSets.map(set => html`
        <div class='l-3col l-gap--1rem'>
          ${set.map(f => html`
            <div class='container-type--normal ${f.column}'>
              <div class='field-container'>
                <label>${f.filter.label}</label>
                <ucd-theme-slim-select @change=${e => this._onFilterChange(e.detail, f.filter.queryParam)}>
                  <select multiple>
                    ${f.filter.options.map(o => html`
                      <option
                        value=${o.value}
                        ?selected=${this.queryArgs[f.filter.queryParam].includes(o.value)}
                        >${o.label}
                      </option>
                    `)}
                  </select>
                </ucd-theme-slim-select>
              </div>
            </div>
          `)}
        </div>
        `)}
    </div>
  `;
}
