import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '../../components/approval-request-status-action.js';
import '../../components/approval-request-details.js';
import '../../components/funding-source-select.js';

export function render() {
return html`
  <div class='l-gutter u-space-mb'>
    <div class='l-basic--flipped'>
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
            <div class='flex flex--space-between bold u-space-py'>
              <div>Total</div>
              <div>$${this.totalExpenditures.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <funding-source-select
          label='Funding Sources'
          indent-body
          expenditure-total=${this.totalExpenditures}
          .data=${this.approvalRequest.fundingSources || []}>
        </funding-source-select>
      </div>
      <div class='l-sidebar-second'>
        <div>
          <h2 class="heading--invert-box size-h4">Approval Required</h2>
          <div class='o-box'>
            <div class='u-space-mb small'>
              <div ?hidden=${!this.approvalChain.length}>${unsafeHTML(this.SettingsModel.getByKey('approval_chain_intro'))}</div>
              <div ?hidden=${this.approvalChain.length}>${unsafeHTML(this.SettingsModel.getByKey('approval_chain_intro_none'))}</div>
            </div>
            <div>
              ${this.approvalChain.map((chainObj) => html`
                <approval-request-status-action .action=${chainObj}></approval-request-status-action>
              `)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class='l-gutter u-space-mb--large'>
    <div class='l-basic--flipped'>
      <div class='l-content'>
        <div class='alignable-promo__buttons'>
        <button
          type="button"
          class='btn btn--primary category-brand--secondary'
          @click=${this._onSubmitButtonClick}
          >Submit</button>
        <a
          type="button"
          class='btn btn--invert category-brand--secondary'
          href=${this.formLink}
          >Cancel</a>
        </div>
      </div>
    </div>
  </div>

`;}
