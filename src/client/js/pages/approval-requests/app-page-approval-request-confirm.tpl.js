import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '../../components/approval-request-status-action.js';
import '../../components/approval-request-details.js';

export function render() {
return html`
  <div class='l-gutter u-space-mb'>
    <div class='l-basic--flipped'>
      <div class='l-content'>
        <h2 class="heading--underline">Trip, Training, or Professional Development Opportunity</h2>
        <approval-request-details .approvalRequest=${this.approvalRequest}></approval-request-details>
        <h2 class="heading--underline">Estimated Expenses</h2>
        <funding-source-select
          label='Funding Sources'
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
