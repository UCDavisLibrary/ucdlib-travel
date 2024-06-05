import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '../../components/approval-request-status-action.js';

export function render() {
return html`
  <div class='l-gutter u-space-mb'>
    <div class='l-basic--flipped'>
      <div class='l-content'></div>
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
