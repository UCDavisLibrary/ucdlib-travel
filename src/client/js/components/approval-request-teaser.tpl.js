import { html } from 'lit';


/**
 * @description Main render function for this component
 * @returns {TemplateResult}
 */
export function render() {
  if ( !this.approvalRequest ) return html``;
  return html`
  <div>
    <div class='flex flex--align-center flex--wrap'>
      <div ?hidden=${!this.approvalStatus} class="badge approval-status">${this.approvalStatus}</div>
      <div ?hidden=${!this.reimbursementStatus} class="badge reimbursement-status">${this.reimbursementStatus}</div>
    </div>

    <div class="teaser">
      <div class="teaser-info">
        <div>
          <a class='title' href="/approval-request/${this.approvalRequest.approvalRequestId}">
            ${this.approvalRequest.label || 'Untitled Request'}
          </a>
        </div>

        <div ?hidden=${this.AuthModel.isCurrentUser(this.approvalRequest.employeeKerberos)} class='requestor'>
          ${this.approvalRequest?.employee?.firstName} ${this.approvalRequest?.employee?.lastName}
        </div>

        ${renderIconGrid('fa-solid fa-building', this.approvalRequest.organization)}
        ${renderIconGrid('fa-solid fa-calendar', this.programDates)}
      </div>

      <div ?hidden=${this.approvalRequest.noExpenditures} class="teaser-expenses">
        <div>
          <b>Projected Expenses</b>
          <br />
          ${this.approvalRequest.fundingSources.map(dep => html`
            ${dep.fundingSourceLabel} - ${this.formatDollar(dep.amount)}<br />
          `)}
        </div>
      </div>

    </div>
  </div>

`;}

/**
 * @description Render text prefix with icon
 * @param {String} icon - icon classes
 * @param {String} text - text to display
 * @returns
 */
function renderIconGrid(icon, text){
  return html`
  <div class='icon-grid' ?hidden=${!text}>
    <div class='icon-container'>
      <i class=${icon}></i>
    </div>
    <div class='small grey'>${text}</div>
  </div>
  `;
}
