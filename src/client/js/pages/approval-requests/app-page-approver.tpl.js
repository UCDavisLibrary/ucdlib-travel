import { html } from 'lit';

import '../../components/approval-request-status-action.js';
import '../../components/approval-request-details.js';

export function render() {
return html`
<div class='l-gutter u-space-mb'>
  <div class='l-basic--flipped'>
    <div class='l-content'>
      <h2 class="heading--underline">Trip, Training, or Professional Development Opportunity</h2>
        <approval-request-details .approvalRequest=${this.approvalRequest}></approval-request-details>
    </div>
    <div class='l-sidebar-second'>
      <div>
        <h2 class="heading--invert-box size-h4">Approval Status</h2>
          <div class='o-box'>
            <div>
              ${(this.approvalRequest.approvalStatusActivity || []).map((chainObj) => html`
                <approval-request-status-action .action=${chainObj}></approval-request-status-action>
              `)}
            </div>
          </div>
      </div>
    </div>
  </div>
</div>
`;}
