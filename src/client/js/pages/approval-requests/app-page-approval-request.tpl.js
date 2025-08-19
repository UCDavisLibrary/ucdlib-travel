import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '../../components/approval-request-header.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';
import objectUtils from '../../../../lib/utils/objectUtils.js';
import typeTransform from '../../../../lib/utils/typeTransform.js';
import reimbursementExpenses from '../../../../lib/utils/reimbursementExpenses.js';

export function render() {
return html`
  <approval-request-header .approvalRequest=${this.approvalRequest} class='u-space-mb--large'></approval-request-header>
  <div class='l-gutter u-space-mb'>
    <div class='l-basic--flipped'>

      <div class='l-sidebar-second'>

        <div class='panel panel--icon panel--icon-custom'>
          <h2 class="panel__title"><span class="panel__custom-icon fa-solid fa-chart-bar panel--icon-pinot"></span>Approval Status</h2>
          <div class='flex flex--align-center flex--wrap u-space-mb'>
            <div class='keep-together u-space-mr--small small grey'>Overall Status: </div>
            <div class='bold primary'>${applicationOptions.approvalStatusLabel(this.approvalRequest.approvalStatus)}</div>
          </div>
          <div>
            ${(this.getApprovalStatusActivity()).map((chainObj) => html`
              <approval-request-status-action .action=${chainObj} @view-comments=${this._onStatusCommentsClick}></approval-request-status-action>
            `)}
          </div>
        </div>

        <div class='panel panel--icon panel--icon-custom' ?hidden=${this._hideReimbursementSection}>
          <h2 class="panel__title"><span class="panel__custom-icon fa-solid fa-money-bill-wave panel--icon-delta"></span>Reimbursement Status</h2>
          <div class='flex flex--align-center flex--wrap u-space-mb'>
            <div class='keep-together u-space-mr--small small grey'>Overall Status: </div>
            <div class='bold primary'>${applicationOptions.reimbursementStatusLabel(this.approvalRequest.reimbursementStatus)}</div>
          </div>
          <div>
            <div class='u-space-mb--small flex flex--space-between flex--align-center small'>
              <div class='u-space-mr--small'>Total Approved Projected Expenses</div>
              <div class='monospace-number'>${typeTransform.toDollarString(this.approvedExpenseTotal, true)}</div>
            </div>
            <div class='u-space-mb--small flex flex--space-between flex--align-center small'>
              <div class='u-space-mr--small'>Total Reimbursement Requested</div>
              <div class='monospace-number'>${typeTransform.toDollarString(this.reimbursementRequestTotal, true)}</div>
            </div>
            <div class='u-space-mb--small flex flex--space-between flex--align-center small'>
              <div class='u-space-mr--small'>Total Reimbursed</div>
              <div class='monospace-number'>${typeTransform.toDollarString(objectUtils.sumArray(this.reimbursementRequests || [], 'reimbursedTotal'), true)}</div>
            </div>
          </div>
          <div class='u-space-mt flex flex--align-center'>
            <i class='fa-solid fa-circle-chevron-right delta u-space-mr--small'></i>
            ${this.approvalRequest?.reimbursementStatus === 'not-submitted' ? html`
              <a href='/approval-request/new-reimbursement/${this.approvalRequestId}'>Create Reimbursement Request</a>
              ` : html`
              <a class='pointer' @click=${() => this.AppStateModel.scrollToAnchor(`${this.id}--reimbursement-requests`)}>View Reimbursement Requests</a>
              `}
          </div>
        </div>

      </div>
      <div class='l-content'>
        <section>
          <h2 class="heading--underline">Trip, Training, or Professional Development Opportunity</h2>
          <approval-request-details .approvalRequest=${this.approvalRequest}></approval-request-details>
        </section>

        <section>
          <h2 class="heading--underline">Estimated Expenses</h2>
          <div ?hidden=${!this.hasApprovedExpenses} class='u-space-mb'>
            <div class='primary bold u-space-mb'>Itemized Expenses</div>
            <div class='u-space-ml--small'>
              ${(this.approvalRequest.expenditures || []).map((expenditure) => html`
                <div class='u-space-mb--small flex flex--space-between'>
                  <div>${expenditure.expenditureOptionLabel}</div>
                  <div><span class='monospace-number'>${typeTransform.toDollarString(expenditure.amount, true)}</span></div>
                </div>
              `)}
              <div class='flex flex--space-between bold u-space-py'>
                <div>Total</div>
                <div><span class='monospace-number'>${typeTransform.toDollarString(this.approvedExpenseTotal, true)}</span></div>
              </div>
            </div>
          </div>
          <funding-source-select
            label='Funding Sources'
            indent-body
            expenditure-total=${this.approvedExpenseTotal}
            .data=${this.approvalRequest.fundingSources || []}>
          </funding-source-select>
        </section>

        <section id='${this.id}--reimbursement-requests' ?hidden=${this._hideReimbursementSection}>
          <h2 class="heading--underline">Reimbursement Requests</h2>
          <div ?hidden=${!this.reimbursementRequests.length}>
            <div class='row row--header'>
              <div class='flex flex--align-center'>Request</div>
              <div class='flex flex--align-center text-align--right'>Amount Requested</div>
              <div class='flex flex--align-center text-align--right'>Amount Reimbursed</div>
            </div>
            ${this.reimbursementRequests.map((rr) => html`
              <div class='row'>
                <div>
                  <div><a class='underline-hover primary bold' href='/reimbursement-request/${rr.reimbursementRequestId}'>${rr.label || 'Untitled Request'}</a></div>
                  <div class='rr-field'>
                    <div>Status<span class='colon'>:</span></div>
                    <div>${applicationOptions.reimbursementStatusLabel(rr.status, 'reimbursementRequest')}</div>
                  </div>
                  <div class='rr-field'>
                    <div>Submitted<span class='colon'>:</span></div>
                    <div>${typeTransform.toLocaleDateTimeString(rr.submittedAt)}</div>
                  </div>
                </div>
                <div>
                  <div class='reimbursement-amount__label'>Amount Requested</div>
                  <div class='monospace-number reimbursement-amount'>${typeTransform.toDollarString(reimbursementExpenses.addExpenses(rr), true)}</div>
                </div>
                <div>
                  <div class='reimbursement-amount__label'>Amount Reimbursed</div>
                  <div class='monospace-number reimbursement-amount'>${typeTransform.toDollarString(rr.reimbursedTotal, true)}</div>
                </div>
              </div>
              `)}
            <div ?hidden=${!this._showReimbursementStatusWarning}>
              <div class='alert u-space-mt--large'>
                ${unsafeHTML(this.SettingsModel.getByKey('approval_request_more_reimbursement_description'))}
                <div class='bold u-space-mt--small'>
                  <a class='pointer' @click=${() => this._onReimbursementWarningClick()}>${this.SettingsModel.getByKey('approval_request_more_reimbursement_action')}</a>
                </div>
              </div>
            </div>
          </div>
          <div ?hidden=${this.reimbursementRequests.length} class='u-space-mb'>
            <div>No reimbursement requests have been submitted.</div>
          </div>
          <div class='bold u-space-mt--large'><a href='/approval-request/new-reimbursement/${this.approvalRequestId}'>Submit a new reimbursement request</a></div>
        </section>

        <section class='activity-history'>
          <h2 class="heading--underline">Activity History</h2>
          <div>
            ${this.activity.map(action => _renderActivityFeedItem.call(this, action))}
          </div>
        </section>
      </div>
    </div>
  </div>
`;}

function _renderActivityFeedItem(action){
  let actionTitle = html`<div class='bold primary'>${action.actionObject.actionTakenText}</div>`;
  if ( action.reimbursementRequestId  ) {
    actionTitle = html`
      <a class='bold primary underline-hover' href='/reimbursement-request/${action.reimbursementRequestId}'>${action.actionObject.actionTakenText}</a>
    `;
  } else if ( action.action?.includes('notification') && action.notificationId){
    actionTitle = html`
    <a class='bold primary underline-hover pointer' @click=${() => this._onActivityClick(action)} title='View Notification'>${action.actionObject.actionTakenText}</a>
    `
  }

  return html`
    <div class='action' action-id=${action.approvalRequestApprovalChainLinkId}>
      <div class='action__header'>
        <div class='icon'>
          <i class='fa-solid ${action.actionObject.iconClass} ${action.actionObject.brandColor}'></i>
        </div>
        <div class='content'>
          ${actionTitle}
          <div class='name-role'>
            <div class='primary small'>${action.employee.firstName} ${action.employee.lastName}</div>
            ${action.approverTypes.map(t => html`
              <div class='flex flex--align-center'>
                <div class='dot'></div>
                <div class='small grey'>${t.approverTypeLabel}</div>
              </div>
            `)}
          </div>
        </div>
        <div class='date'>
          <div>${action.occurredDateString}</div>
          <div>${action.occurredTimeString}</div>
        </div>
      </div>
      <div ?hidden=${!action.comments} class='comment'>
        <div class='bold'>Comments</div>
        <div class='small'>${action.comments}</div>
      </div>
    </div>
  `;
}
