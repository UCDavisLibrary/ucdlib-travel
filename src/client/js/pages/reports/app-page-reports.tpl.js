import { html } from 'lit';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';

export function render() {
return html`
  <ucdlib-pages id='main-pages' selected=${this.page}>
    ${render403.call(this)}
    ${renderReportBuilder.call(this)}
  </ucdlib-pages>
`;}


function render403() {
  return html`
    <div id=${this.getPageId('403')}>
      <div class='message-403'>
        <div class='message-403--icon'>
          <i class='fas fa-exclamation-circle'></i>
        </div>
        <div class='bold'>Not Authorized</div>
        <div class='small grey'>
          <div>You are not authorized to use the report builder tool.</div>
          <div ?hidden=${!this.helpUrl}>
            <div>To request access, please use the following form:</div>
            <div><a href=${this.helpUrl}>${this.helpUrl}</a></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderReportBuilder(){
  return html`<div id=${this.getPageId('builder')}>this is the report builder</div>`
}
