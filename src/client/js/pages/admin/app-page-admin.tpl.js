import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() { 
return html`
<div class="l-gutter--narrow panel">
<section class="article-list">
<div class="vm-listing">
  <div class="vm-listing__figure">
    <a href="/admin/approvers"><i class="fas fa-solid fa-money-bill"></i>
</a>
  </div>
  <div class="vm-listing__body">
    <h3 class="vm-listing__title"><a href="/admin/approvers">Approvers and Funding Sources</a></h3>
      <div class="vm-listing__submitted" ?hidden=${this.userCantSubmit}>${unsafeHTML(this.SettingsModel.getByKey('admin_approvers_funding_page_description'))}</div>
  </div>
</div>
<div class="vm-listing">
  <div class="vm-listing__figure">
    <a href="/admin/reimbursement"><i class="fas fa-solid fa-money-check"></i>
</a>
  </div>
  <div class="vm-listing__body">
    <h3 class="vm-listing__title"><a href="/admin/reimbursement">Reimbursement Requests</a></h3>
    <div class="vm-listing__submitted" ?hidden=${this.userCantSubmit}>${unsafeHTML(this.SettingsModel.getByKey('admin_reimbursement_requests_page_description'))}</div>
    </div>
</div>
<div class="vm-listing">
  <div class="vm-listing__figure">
    <a href="/admin/allocations"><i class="fas fa-solid fa-credit-card"></i>
</a>
  </div>
  <div class="vm-listing__body">
    <h3 class="vm-listing__title"><a href="/admin/allocations">Employee Allocations</a></h3>
    <div class="vm-listing__submitted" ?hidden=${this.userCantSubmit}>${unsafeHTML(this.SettingsModel.getByKey('admin_employee_allocations_page_description'))}</div>
    </div>
</div>
<div class="vm-listing">
  <div class="vm-listing__figure">
    <a href="/admin/settings"><i class="fas fa-solid fa-gear"></i>
</a>
  </div>
  <div class="vm-listing__body">
    <h3 class="vm-listing__title"><a href="/admin/settings">General Settings</a></h3>
    <div class="vm-listing__submitted" ?hidden=${this.userCantSubmit}>${unsafeHTML(this.SettingsModel.getByKey('admin_allocations_general_settings_page_description'))}</div>
    </div>
</div>
<div class="vm-listing">
  <div class="vm-listing__figure">
    <a href="/admin/line-items"><i class="fas fa-solid fa-list"></i>
</a>
  </div>
  <div class="vm-listing__body">
    <h3 class="vm-listing__title"><a href="/admin/line-items">Line Items</a></h3>
    <div class="vm-listing__submitted" ?hidden=${this.userCantSubmit}>${unsafeHTML(this.SettingsModel.getByKey('admin_allocations_line_items_page_description'))}</div>
    </div>
</div>

</section>
  </div>

`;}