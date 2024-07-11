import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import '../../components/approval-request-header.js';
import '../../components/reimbursement-form.js';

export function render() {
return html`
  <approval-request-header
    .approvalRequest=${this.approvalRequest}
    hide-actions
    class='u-space-mb--large'>
  </approval-request-header>
  <div class='l-gutter l-basic--flipped'>
    <div class='l-content'>
      <h2 class='heading--underline'>New Reimbursement Request</h2>
      <reimbursement-form
        ${ref(this.form)}
        .approvalRequestId=${this.approvalRequestId}
        .parentPageId=${this.id}
        .hasTravel=${this.approvalRequest?.travelRequired ? true : false}>
      </reimbursement-form>
    </div>
    <div class='l-sidebar-first'>
      <a
        href='${this.AppStateModel.store.breadcrumbs['approval-requests'].link}/${this.approvalRequestId}'
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
`;}
