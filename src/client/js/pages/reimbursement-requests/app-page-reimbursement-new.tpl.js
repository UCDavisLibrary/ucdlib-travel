import { html } from 'lit';
import '../../components/approval-request-header.js';

export function render() {
return html`
  <approval-request-header
    .approvalRequest=${this.approvalRequest}
    hide-actions
    class='u-space-mb--large'>
  </approval-request-header>
  <div class='l-gutter l-basic--flipped'>
    <div class='l-content'>
      New Reimbursement Request
    </div>
    <div class='l-sidebar-first'></div>
  </div>
`;}
