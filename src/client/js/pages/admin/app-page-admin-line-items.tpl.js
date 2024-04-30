import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() {
return html`
  <div class='l-gutter'>
    <p>${unsafeHTML(this.SettingsModel.getByKey('admin_line_items_description'))}</p>
  </div>


`;}
