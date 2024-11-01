import { html } from 'lit';

import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js';
import "../../components/approval-request-teaser.js";

export function render() {
return html`
  <div class='l-gutter l-basic--flipped'>
    <div class='l-content'>
      <p class='u-space-mb--medium'>The following are travel, training, or professional development requests
        that you have approved or need your approval based on the funding source selected by the requester:</p>

      ${renderFilters.call(this)}
      <div ?hidden=${!this.approvalRequests.length}>
        ${this.approvalRequests.map(request => html`
          <div class='approval-request-teaser-wrapper'>
            <approval-request-teaser
              always-show-submitter
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
          <div class='u-space-ml--small'>You have not been listed as an approver for any request.</div>
        </div>
      </div>
    </div>
    <div class='l-sidebar-first'>

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
