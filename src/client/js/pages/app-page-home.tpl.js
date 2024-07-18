import { html } from 'lit';

import "../components/approval-request-teaser.js";
import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js'

export function render() {
return html`
<app-questions-or-comments></app-questions-or-comments>
  <div class='l-gutter watercolor-bg--blue'>
    <div class="l-shrink u-space-py--large">
      <h2 class='heading--center-underline u-space-mb--large'>Your Active Requests</h2>

      <div ?hidden=${!this.ownApprovalRequests.length}>
        ${this.ownApprovalRequests.map(request => html`
          <div class='approval-request-teaser-wrapper bg-white'>
            <approval-request-teaser .approvalRequest=${request}></approval-request-teaser>
          </div>
        `)}
        <div ?hidden=${this.ownTotalPages === 1} class="flex flex--justify-center">
          <ucd-theme-pagination
            current-page=${this.ownPage}
            max-pages=${this.ownTotalPages}
            @page-change=${e => this._onPageChange(e, 'own-page')}
            xs-screen>
          </ucd-theme-pagination>
        </div>
      </div>

      <div ?hidden=${this.ownApprovalRequests.length}>
        <div class='flex flex--align-center flex--justify-center u-space-py'>
          <i class='fa-solid fa-circle-exclamation fa-2x admin-blue'></i>
          <div class='u-space-ml--small'>You do not have any active requests.</div>
        </div>
      </div>

      <div class='alignable-promo__buttons flex flex--justify-center flex--wrap u-space-mt--large'>
        <a class='btn' href='/approval-request'>View All Your Requests</a>
        <a class='btn btn--alt3' href='/approval-request/new'>Submit A New Request</a>
      </div>
    </div>
  </div>

  <div class='l-gutter'>
    <div class="l-shrink u-space-py--large">
      <h2 class='heading--center-underline u-space-mb--large'>Active Requests Submitted To You</h2>

      <div ?hidden=${!this.approverApprovalRequests.length}>
        ${this.approverApprovalRequests.map(request => html`
          <div class='approval-request-teaser-wrapper bg-white'>
            <approval-request-teaser .approvalRequest=${request}></approval-request-teaser>
          </div>
        `)}
        <div ?hidden=${this.approverTotalPages === 1} class="flex flex--justify-center">
          <ucd-theme-pagination
            current-page=${this.approverPage}
            max-pages=${this.approverTotalPages}
            @page-change=${e => this._onPageChange(e, 'approver-page')}
            xs-screen>
          </ucd-theme-pagination>
        </div>
      </div>

      <div ?hidden=${this.approverApprovalRequests.length}>
        <div class='flex flex--align-center flex--justify-center u-space-py'>
          <i class='fa-solid fa-circle-exclamation fa-2x admin-blue'></i>
          <div class='u-space-ml--small'>You do not have any active requests submitted to you.</div>
        </div>
      </div>

      <div class='flex flex--justify-center u-space-mt--large'>
        <a class='btn' href='/approve'>View All Requests Approved By You</a>
      </div>
    </div>

  </div>

`;}
