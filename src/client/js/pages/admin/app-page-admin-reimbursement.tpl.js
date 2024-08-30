import { html } from 'lit';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';
import typeTransform from '../../../../lib/utils/typeTransform.js';
import reimbursementExpenses from '../../../../lib/utils/reimbursementExpenses.js';

import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js'
import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js'

/**
 * @description Main render function for this element
 * @returns {TemplateResult}
 */
export function render() {
return html`

<div class='l-gutter u-space-mb--large'>
  <div class='l-basic--flipped'>
    <div class='l-content'>

      <div class='filters'>
        <div class='field-container'>
          <label>Status</label>
          <ucd-theme-slim-select @change=${e => this._onFilterChange(e.detail, 'selectedStatusFilters')}>
            <select multiple>
              ${applicationOptions.reimbursementRequestStatuses.map(option => html`
                <option
                  value=${option.value}
                  ?selected=${this.selectedStatusFilters.includes(option.value)}>${option.label}
                </option>
              `)}
            </select>
          </ucd-theme-slim-select>
        </div>
      </div>

      <div class='results'>
        <div ?hidden=${this._queryState !== 'loaded'}>${this.results.map(r => renderReimbursementTeaser.call(this, r))}</div>
        <div ?hidden=${this._queryState !== 'loading'} class='flex flex--justify-center'>
          <i class="fa-solid fa-circle-notch fa-spin primary fa-2x"></i>
        </div>
        <div ?hidden=${this._queryState !== 'no-results'} class='alert flex'>
          <i class="fa-solid fa-circle-exclamation pad-icon-top"></i>
          <span class='u-space-ml--small'>No reimbursement requests match the applied filters.</span>
        </div>
        <ucd-theme-pagination
          max-pages=${this.maxPage}
          current-page=${this.page}
          @page-change=${this._onPageChange}>
        </ucd-theme-pagination>
      </div>

    </div>
    <div class='l-sidebar-second'>

    </div>
  </div>
</div>
`;}

/**
 * @description Render a single reimbursement request teaser
 * @param {Object} r - reimbursement request object
 * @returns {TemplateResult}
 */
function renderReimbursementTeaser(r){
  if ( !r?.reimbursementRequestId ) return html``;
  const hasDefaultLabel = r.label === 'Reimbursement Request';
  return html`
    <div class='reimbursement-request'>
      <div class='flex flex--wrap u-space-mb--small'>
        <div class='badge'>${applicationOptions.reimbursementStatusLabel(r.status, 'reimbursementRequest', true)}</div>
      </div>
      <div class='teaser-body'>
        <div class='teaser-info'>
          <a class='underline-hover inherit-color' href='/reimbursement-request/${r.reimbursementRequestId}'>
            <h2 class='heading--highlight'>${hasDefaultLabel ? r.approvalRequest.label : r.label}</h2>
          </a>
          <div class='primary bold'>${r.approvalRequest?.employee?.firstName} ${r.approvalRequest?.employee?.lastName}</div>
          <div class='u-space-mt--small'>
            <div class='flex flex--align-center small' ?hidden=${hasDefaultLabel}>
              <i class='fa-solid fa-briefcase'></i>
              <span class='u-space-ml--small grey'>${r.approvalRequest.label}</span>
            </div>
            <div class='flex flex--align-center small'>
              <i class='fa-solid fa-upload'></i>
              <span class='u-space-ml--small grey'>${typeTransform.toLocaleDateTimeString(r.submittedAt)}</span>
            </div>
          </div>
        </div>
        <div class='teaser-expenses'>
          <span class='bold'>Amount: </span><span>$${reimbursementExpenses.addExpenses(r.expenses || [])}</span>
        </div>
      </div>
    </div>
  `;
}
