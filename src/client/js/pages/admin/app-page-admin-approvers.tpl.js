import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-subnav/ucd-theme-subnav.js';
import "../../components/app-approver-type.js"
import "../../components/admin-funding-source-management.js";

export function render() {
return html`
<div class='l-basic--flipped l-gutter'>
  <div class="l-content u-space-mb--large">
    <app-approver-type
      ${ref(this.approverTypeEle)}
      parent-page-id=${this.id}
      class='u-space-mb--large'>
    </app-approver-type>
    <admin-funding-source-management
      ${ref(this.fundingSourceEle)}
      parent-page-id=${this.id}>
    </admin-funding-source-management>
  </div>
  <div class="l-sidebar-first">
    <ucd-theme-subnav @item-click=${this._onSubNavClick}>
      <a>Approver Types</a>
      <a>Funding Sources</a>
    </ucd-theme-subnav>
  </div>
</div>


`;}
