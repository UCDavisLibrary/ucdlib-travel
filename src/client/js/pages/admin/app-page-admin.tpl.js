import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() {
return html`
<div class="l-gutter--narrow panel">
  <section class="article-list">

    <div class="vm-listing">
      <div class="vm-listing__figure has-icon category-brand--cabernet category-brand__background">
        <a href="/admin/approval-requests">
          <div class='icon-img'>
            <i class="fas fa-solid fa-money-bill fa-2x"></i>
          </div>
        </a>
      </div>
      <div class="vm-listing__body">
        <h3 class="vm-listing__title"><a href="/admin/approval-requests">Approval Requests</a></h3>
          <div class="vm-listing__submitted">${unsafeHTML(this.SettingsModel.getByKey('admin_approval_requests_page_description'))}</div>
      </div>
    </div>
    
    <div class="vm-listing">
      <div class="vm-listing__figure has-icon category-brand--cabernet category-brand__background">
        <a href="/admin/approvers">
          <div class='icon-img'>
            <i class="fas fa-solid fa-money-bill fa-2x"></i>
          </div>
        </a>
      </div>
      <div class="vm-listing__body">
        <h3 class="vm-listing__title"><a href="/admin/approvers">Approvers and Funding Sources</a></h3>
          <div class="vm-listing__submitted">${unsafeHTML(this.SettingsModel.getByKey('admin_approvers_funding_page_description'))}</div>
      </div>
    </div>

    <div class="vm-listing">
      <div class="vm-listing__figure has-icon category-brand--redbud category-brand__background">
        <a href="/admin/reimbursement">
          <div class='icon-img'>
            <i class="fas fa-solid fa-money-check fa-2x"></i>
          </div>
        </a>
      </div>
      <div class="vm-listing__body">
        <h3 class="vm-listing__title"><a href="/admin/reimbursement">Reimbursement Requests</a></h3>
        <div class="vm-listing__submitted">${unsafeHTML(this.SettingsModel.getByKey('admin_reimbursement_requests_page_description'))}</div>
        </div>
    </div>

    <div class="vm-listing">
      <div class="vm-listing__figure has-icon category-brand--pinot category-brand__background">
        <a href="/admin/allocations">
          <div class='icon-img'>
            <i class="fas fa-solid fa-credit-card fa-2x"></i>
          </div>
        </a>
      </div>
      <div class="vm-listing__body">
        <h3 class="vm-listing__title"><a href="/admin/allocations">Employee Allocations</a></h3>
        <div class="vm-listing__submitted">${unsafeHTML(this.SettingsModel.getByKey('admin_employee_allocations_page_description'))}</div>
        </div>
    </div>

    <div class="vm-listing">
      <div class="vm-listing__figure has-icon category-brand--delta category-brand__background">
        <a href="/admin/settings">
          <div class='icon-img'>
            <i class="fas fa-solid fa-gear fa-2x"></i>
          </div>
        </a>
      </div>
      <div class="vm-listing__body">
        <h3 class="vm-listing__title"><a href="/admin/settings">General Settings</a></h3>
        <div class="vm-listing__submitted">${unsafeHTML(this.SettingsModel.getByKey('admin_allocations_general_settings_page_description'))}</div>
        </div>
    </div>

    <div class="vm-listing">
      <div class="vm-listing__figure has-icon category-brand--redwood category-brand__background">
        <a href="/admin/line-items">
          <div class='icon-img'>
            <i class="fas fa-solid fa-list fa-2x"></i>
          </div>
        </a>
      </div>
      <div class="vm-listing__body">
        <h3 class="vm-listing__title"><a href="/admin/line-items">Line Items</a></h3>
        <div class="vm-listing__submitted" >${unsafeHTML(this.SettingsModel.getByKey('admin_allocations_line_items_page_description'))}</div>
        </div>
    </div>

  </section>
</div>

`;}
