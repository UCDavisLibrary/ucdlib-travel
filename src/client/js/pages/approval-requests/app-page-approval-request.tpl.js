import { html } from 'lit';
import '../../components/approval-request-header.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';

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

      </div>
      <div class='l-content'>
        <div>
          <h2 class="heading--underline">Trip, Training, or Professional Development Opportunity</h2>
          <approval-request-details .approvalRequest=${this.approvalRequest}></approval-request-details>
        </div>

        <div>
          <h2 class="heading--underline">Estimated Expenses</h2>
          <div ?hidden=${!this.totalExpenditures} class='u-space-mb'>
            <div class='primary bold u-space-mb'>Itemized Expenses</div>
            <div class='u-space-ml--small'>
              ${(this.approvalRequest.expenditures || []).map((expenditure) => html`
                <div class='u-space-mb--small flex flex--space-between'>
                  <div>${expenditure.expenditureOptionLabel}</div>
                  <div>$${expenditure.amount.toFixed(2)}</div>
                </div>
              `)}
              <div class='flex flex--space-between bold u-space-py'>
                <div>Total</div>
                <div>$${this.totalExpenditures.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <funding-source-select
            label='Funding Sources'
            indent-body
            expenditure-total=${this.totalExpenditures}
            .data=${this.approvalRequest.fundingSources || []}>
          </funding-source-select>
        </div>

        <div class='activity-history'>
          <h2 class="heading--underline">Activity History</h2>
          <div>
            ${this.activity.map((action) => html`
              <div class='action' action-id=${action.approvalRequestApprovalChainLinkId}>
                <div class='action__header'>
                  <div class='icon'>
                    <i class='fa-solid ${action.actionObject.iconClass} ${action.actionObject.brandColor}'></i>
                  </div>
                  <div class='content'>
                    <div class='bold primary'>${action.actionObject.actionTakenText}</div>
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
            `)}
          </div>
        </div>

      </div>
    </div>
  </div>


`;}
