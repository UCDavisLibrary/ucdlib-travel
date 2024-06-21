import { html } from 'lit';

export function render() {
return html`
  <div class='l-gutter u-space-py--large watercolor-bg'>
    <div class=${this.availableActions.length ? 'l-basic--flipped' : ''}>

      <div class='l-content'>
        <div class='flex flex--align-center' ?hidden=${this.approvalRequest.employeeKerberos === this.AuthModel.getToken().id}>
          <i class='fa-solid fa-user secondary u-space-mr--small'></i>
          <div class='grey small bold'>${this.approvalRequest?.employee?.firstName || ''} ${this.approvalRequest?.employee?.lastName || ''}</div>
        </div>
        <h1 class='u-space-mt--flush'>${this.approvalRequest.label || ''}</h1>
        <div class='bold primary'>
          <div>${this.approvalRequest.organization || ''}</div>
          <div>${this.getProgramDates()}</div>
        </div>
      </div>

      <div class='l-sidebar-first actions' ?hidden=${!this.availableActions.length}>
        <h5>Available Actions</h5>
        ${this.availableActions.map(action => html`
          <a @click=${e => this._onActionClick(action)} class='flex flex--align-center pointer underline-hover u-space-mb--small'>
            <i class='fa-solid fa-circle-chevron-right secondary u-space-mr--small'></i>
            <div class='bold'>${action.label}</div>
          </a>
        `)}
      </div>
    </div>
  </div>
`;}
