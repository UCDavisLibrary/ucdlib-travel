import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() {
return html`
  <div class='l-gutter u-space-mb--large'>
    <div class='l-basic--flipped'>
      <div class='l-content'></div>
      <div class='l-sidebar-second'>
        <div>
          <h2 class="heading--invert-box size-h4">Approval Required</h2>
          <div class='o-box'>
            <div ?hidden=${!this.approvalChain.length}>${unsafeHTML(this.SettingsModel.getByKey('approval_chain_intro'))}</div>
            <div ?hidden=${this.approvalChain.length}>${unsafeHTML(this.SettingsModel.getByKey('approval_chain_intro_none'))}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

`;}
