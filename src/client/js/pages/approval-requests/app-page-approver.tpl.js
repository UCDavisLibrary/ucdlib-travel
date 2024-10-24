import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';

import '../../components/approval-request-status-action.js';
import '../../components/approval-request-details.js';
import '../../components/funding-source-select.js';
import '../../components/user-current-allocation-summary.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';

export function render() {
return html`
<div class='l-gutter u-space-mb'>
  <div class='l-basic--flipped'>
    <div class='l-sidebar-second'>

        <div class='panel panel--icon panel--icon-custom' ?hidden=${!this.isNextApprover}>
          <h2 class="panel__title"><span class="panel__custom-icon fa-solid fa-diagram-project panel--icon-secondary"></span>Approver Actions</h2>
          ${renderApprovalForm.call(this)}
        </div>

        <div class='panel panel--icon panel--icon-custom'>
          <h2 class="panel__title"><span class="panel__custom-icon fa-solid fa-chart-bar panel--icon-pinot"></span>Approval Status</h2>
          <div>
            ${(this.approvalRequest.approvalStatusActivity || []).map((chainObj) => html`
              <approval-request-status-action .action=${chainObj} hide-comments-links show-date></approval-request-status-action>
            `)}
          </div>
        </div>

        <user-current-allocation-summary
          page-id=${this.id}
          for-another
          approval-request-id=${this.approvalRequestId}
          ${ref(this.allocationSummaryRef)}
          >
        </user-current-allocation-summary>
      </div>
    <div class='l-content'>
      <h2 class="heading--underline">Trip, Training, or Professional Development Opportunity</h2>
        <approval-request-details .approvalRequest=${this.approvalRequest}></approval-request-details>
        <h2 class="heading--underline">Estimated Expenses</h2>
        <div ?hidden=${!this.totalExpenditures} class='u-space-mb'>
          <div class='primary bold u-space-mb'>Itemized Expenses</div>
          <div class='u-space-ml--small'>
            ${(this.approvalRequest.expenditures || []).map((expenditure) => html`
              <div class='u-space-mb--small flex flex--space-between'>
                <div>${expenditure.expenditureOptionLabel}</div>
                <div>$${expenditure.amount.toFixed(2)}</div>
              </div>
            `)}
            <div class='flex flex--space-between bold u-space-py primary'>
              <div>Total</div>
              <div>$${this.totalExpenditures.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <funding-source-select
          ${ref(this.fundingSourceSelectRef)}
          label='Funding Sources'
          @funding-source-input=${this._onFundingSourceInput}
          can-toggle-view
          reallocate-only
          indent-body
          expenditure-total=${this.totalExpenditures}
          .data=${this.fundingSources}>
        </funding-source-select>
    </div>
  </div>
</div>
`;}

function renderApprovalForm(){
  return html`
    <form @submit=${this._onApprovalFormSubmit} class='approval-form'>
      <div class='field-container'>
        <label>Your Comments (Optional)</label>
        <textarea rows=4 .value=${this.comments} @input=${e => this.comments = e.target.value } ></textarea>
      </div>
      <div class='alignable-promo__buttons'>
        <div>
          <button type="submit" class='btn btn--primary btn--block' ?hidden=${this.isFundingSourceChange}>${applicationOptions.approvalStatusActionLabel('approve')}</button>
        </div>
        <div>
          <button type="submit" class='btn btn--primary btn--block' ?hidden=${!this.isFundingSourceChange} ?disabled=${this.fundingSourceError}>${applicationOptions.approvalStatusActionLabel('approve-with-changes')}</button>
        </div>
        <div>
          <button type="button" class='btn btn--invert btn--block' @click=${() => this._onApprovalFormSubmit('request-revision')}>${applicationOptions.approvalStatusActionLabel('request-revision')}</button>
        </div>
        <div class='category-brand--double-decker'>
          <button type="button" class='btn btn--invert btn--block' @click=${() => this._onApprovalFormSubmit('deny')}>${applicationOptions.approvalStatusActionLabel('deny')}</button>
        </div>

      </div>
    </form>
  `;
}
