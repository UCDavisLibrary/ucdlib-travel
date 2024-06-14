import { html } from 'lit';

import "../components/approval-request-teaser.js";


export function render() {
return html`
  <div class='l-container'>
    <div class='l-basic--flipped'>
      <div class="l-content">
        <p>Home Page</p>
        <approval-request-teaser></approval-request-teaser>
      </div>
    </div>
  </div>

`;}
