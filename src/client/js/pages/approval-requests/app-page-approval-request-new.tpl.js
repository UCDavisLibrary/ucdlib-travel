import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() {
return html`
  <div class='l-gutter u-space-mb--large'>
    <div class='l-basic--flipped'>
      <div class ='l-content'>
        <p>${unsafeHTML(this.SettingsModel.getByKey('approval_request_form_intro'))}</p>
        <form class='skinny-form'>
          <p>hello world</p>
        </form>
      </div>
      <div class='l-sidebar-second'>
      </div>
    </div>
  </div>

`;}
