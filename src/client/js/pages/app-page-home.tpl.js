import { html } from 'lit';

import "../components/approval-request-teaser.js";


export function render() {
return html`
  <div class='l-container'>
      <div class="l-shrink">
        <p>Home Page</p>
        ${this.approvalRequests.map(ar => html`
          <approval-request-teaser .approvalRequest=${ar} class='u-space-mb--large'></approval-request-teaser>
        `)}
      </div>
  </div>

`;}
