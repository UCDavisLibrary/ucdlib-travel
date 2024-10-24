import { html } from 'lit';

import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js'
import "../../components/approval-request-teaser.js";

export function render() {
return html`
  <div class='l-gutter l-basic--flipped'>
    <div class='l-content'>
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
          current-page=${this.page}
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
