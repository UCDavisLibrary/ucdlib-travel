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
      <a href='#'>Submit a Request</a>
      <a href='#'>Your Submitted Requests</a>
      <a href='#'>Approver a Request</a>
      <a href='#'>Reports</a>
    </ucd-theme-primary-nav>

    <ucd-theme-quick-links title="Application Administration" style-modifiers="highlight">
      <a href="#">General Settings</a>
      <a href="#">Expenditure Option</a>
      <a href="#">Approvers and Funding Sources</a>
      <a href="#">Line Items</a>
      <a href="#">Employee Allocation</a>
      <a href="#">Reimbursements Requests</a>
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
    <app-page-home id='home'></app-page-home>
    <app-page-request-new id='request-new'></app-page-request-new>
    <app-page-request id='request'></app-page-request>
    <app-page-request-single id='request-single'></app-page-request-single>
    <app-page-reimbursement id='reimbursement'></app-page-reimbursement>
    <app-page-reimbursement-new id='reimbursement-new'></app-page-reimbursement-new>
    <app-page-reimbursement-single id='reimbursement-single'></app-page-reimbursement-single>
    <app-page-reports id='reports'></app-page-reports>
    <app-page-approver id='approver'></app-page-approver>
    <app-page-approver-single id='approver-single'></app-approver-single>
    <app-page-employee-allocation-new id='employee-allocation-new'></app-page-employee-allocation-new>
    <app-page-employee-allocation-single id='employee-allocation-single'></app-page-employee-allocation-single>
    <app-page-employee-allocation id='employee-allocation'></app-page-employee-allocation>
    <app-page-settings id='settings'></app-page-settings>
    <app-page-line-items id='line-items'></app-page-line-items>
    <app-page-funding-sources id='funding-sources'></app-page-funding-sources>


  </ucdlib-pages>

`;}
