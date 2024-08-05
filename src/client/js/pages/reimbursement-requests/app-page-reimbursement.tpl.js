import { html } from 'lit';
import '../../components/approval-request-header.js';

export function render() {
return html`
  <approval-request-header .approvalRequest=${this.approvalRequest} class='u-space-mb--large'></approval-request-header>
  <div class='l-gutter u-space-mb'>
    <div class='l-basic--flipped'>
      <div class='l-content'></div>
      <div class='l-sidebar-second'>
        <a
          href='${this.AppStateModel.store.breadcrumbs['approval-requests'].link}/${this.approvalRequest?.approvalRequestId}'
          class="focal-link u-space-mb category-brand--tahoe">
          <div class="focal-link__figure focal-link__icon">
            <i class="fas fa-arrow-left fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <strong>Back to Approval Request</strong>
          </div>
        </a>
      </div>
    </div>
  </div>
`;}
