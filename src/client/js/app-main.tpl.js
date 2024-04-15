import { html } from 'lit';

export function render() {
return html`
  <ucd-theme-header>
    <ucdlib-branding-bar slogan=${this.appTitle}>
      ${this.userIsAuthenticated ? html`
        <a href='/logout' ?hidden=${!this.userIsAuthenticated}>Logout</a>
      ` : html``}
    </ucdlib-branding-bar>

    <!-- TODO: Replace these with your own primary nav links -->

    <ucd-theme-primary-nav>
      <a href='/request/new'>Submit a Request</a>
      <a href='/request'>Your Submitted Request</a>
      <a href='/approver'>Approve a Request</a>
      <a href='/reports'>Reports</a>
    </ucd-theme-primary-nav>

    <ucd-theme-quick-links title="Application Administration" style-modifiers="highlight">
      <a href="/admin#appovers">Approvers and Funding Sources</a>
      <a href="/admin#settings">General Settings</a>
      <a href="/admin#allocations">Employee Allocations</a>
      <a href="/admin#items">Line Items</a>
      <a href="/reimbursement">Reimbursement Requests</a>
    </ucd-theme-quick-links>
  </ucd-theme-header>
  <!-- <ucdlib-iam-alert></ucdlib-iam-alert> -->

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

  <!-- TODO: Replace these with your own pages -->
  <ucdlib-pages id='main-pages' selected=${this.page}>
    <app-page-alt-state id=${this._notLoadedPageId} .state=${this.pageState} .errorMessage=${this.errorMessage}></app-page-alt-state>
    <app-page-foo id='foo'></app-page-foo>
    <app-page-home id='home'></app-page-home>
    <app-page-admin id='admin'></app-page-admin>
    <app-page-approver id='approver'></app-page-approver>
    <app-page-reimbursement id='reimbursement'></app-page-reimbursement>
    <app-page-reimbursement-new id='reimbursement-new'></app-page-reimbursement-new>
    <app-page-reports id='reports'></app-page-reports>
    <app-page-request id='request'></app-page-request>
    <app-page-request-new id='request-new'></app-page-request-new>

  </ucdlib-pages>

`;}
