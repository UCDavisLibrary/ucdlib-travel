import { html } from 'lit';

import "../components/approval-request-teaser.js";


export function render() {
return html`
  <div class='l-container'>
  <approval-request-teaser .approvalRequest=${this.approvalRequests}></approval-request-teaser>

    <div class='l-basic--flipped'>
      <div class="l-content">
        <p>Home Page</p>
      </div>
    </div>
  </div>

`;}
