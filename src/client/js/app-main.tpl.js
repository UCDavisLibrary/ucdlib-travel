import { html } from 'lit';

export function render() {
return html`
  <ucd-theme-header>
    <ucdlib-branding-bar slogan=${this.appTitle}>
      ${this.userIsAuthenticated ? html`
        <a href='/logout' ?hidden=${!this.userIsAuthenticated}>Logout</a>
      ` : html``}
    </ucdlib-branding-bar>

    <ucd-theme-primary-nav>
      <a href='/approval-request/new'>Get Approval</a>
      <a href='/approval-request'>Submitted Approval Requests</a>
      <a href='/approver'>Approve a Request</a>
      <a href='/reports'>Reports</a>
    </ucd-theme-primary-nav>

    <ucd-theme-quick-links
      title="Application Administration"
      style-modifiers="highlight"
      ?hidden=${!this.AuthModel.getToken().hasAdminAccess}
      >
      <a href="/admin/approvers">Approvers and Funding Sources</a>
      <a href="/admin/reimbursement">Reimbursement Requests</a>
      <a href="/admin/allocations">Employee Allocations</a>
      <a href="/admin/settings">General Settings</a>
      <a href="/admin/line-items">Line Items</a>
    </ucd-theme-quick-links>
  </ucd-theme-header>
  
  <section ?hidden=${!this.pageIsLoaded || !this.showPageTitle}>
    <h1 class="page-title">${this.pageTitle}</h1>
  </section>

  <ol class="breadcrumbs" ?hidden=${!this.pageIsLoaded || !this.showBreadcrumbs}>
    ${this.breadcrumbs.map((b, i) => html`
      <li>
      ${i == this.breadcrumbs.length - 1 ? html`<span>${b.text}</span>` : html`<a href=${b.link}>${b.text}</a>`}
      </li>
    `)}
  </ol>
  <ucdlib-pages id='main-pages' selected=${this.page}>
    <app-page-alt-state id=${this._notLoadedPageId} .state=${this.pageState} .errorMessage=${this.errorMessage}></app-page-alt-state>
    <app-page-home id='home'></app-page-home>
    <app-page-admin id='admin'></app-page-admin>
    <app-page-admin-approvers id='admin-approvers'></app-page-admin-approvers>
    <app-page-admin-settings id='admin-settings'></app-page-admin-settings>
    <app-page-admin-allocations id='admin-allocations'></app-page-admin-allocations>
    <app-page-admin-allocations-new id='admin-allocations-new'></app-page-admin-allocations-new>
    <app-page-admin-line-items id='admin-line-items'></app-page-admin-line-items>
    <app-page-admin-reimbursement id='admin-reimbursement'></app-page-admin-reimbursement>
    <app-page-approver id='approver'></app-page-approver>
    <app-page-reimbursement id='reimbursement'></app-page-reimbursement>
    <app-page-reimbursement-new id='reimbursement-new'></app-page-reimbursement-new>
    <app-page-reports id='reports'></app-page-reports>
    <app-page-approval-requests id='approval-requests'></app-page-approval-requests>
    <app-page-approval-request id='approval-request'></app-page-approval-request>
    <app-page-approval-request-new id='approval-request-new'></app-page-approval-request-new>
  </ucdlib-pages>
  <app-toast></app-toast>
  <app-dialog-modal></app-dialog-modal>

`;}
