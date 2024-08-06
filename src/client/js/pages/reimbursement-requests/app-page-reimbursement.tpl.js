import { html } from 'lit';
import '../../components/approval-request-header.js';
import typeTransform from '../../../../lib/utils/typeTransform.js';

export function render() {
return html`
  <approval-request-header .approvalRequest=${this.approvalRequest} class='u-space-mb--large'></approval-request-header>
  <div class='l-gutter u-space-mb'>
    <div class='l-basic--flipped u-space-mb'>
      <div class='l-content'>
        <h2 class="heading--underline">Reimbursement Request</h2>
        <div>
          ${renderBasicField('Request Title', this.reimbursementRequest?.label, "Untitled Request")}
          ${renderBasicField('Submitted', typeTransform.toLocaleDateTimeString(this.reimbursementRequest?.submittedAt))}
          ${renderBasicField('City of Residence', this.reimbursementRequest?.employeeResidence)}
          ${renderBasicField('Dates', typeTransform.dateRangeFromIsoString(this.reimbursementRequest?.travelStart, this.reimbursementRequest?.travelEnd))}
          ${renderBasicField('Personal Time', this.reimbursementRequest?.personalTime, "None")}
          ${renderBasicField('Comments', this.reimbursementRequest?.comments, "None")}
        </div>

      </div>
      <div class='l-sidebar-second'>
        <a
          href='${this.AppStateModel.store.breadcrumbs['approval-requests'].link}/${this.approvalRequest?.approvalRequestId}'
          class="focal-link u-space-mb category-brand--tahoe">
          <div class="focal-link__figure focal-link__icon">
            <i class="fas fa-arrow-left fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <strong>Back to Approval Request</strong>
          </div>
        </a>
      </div>
    </div>
    <div>
      <h3>Line Item Expenses</h3>
      <div ?hidden=${!this._transportationExpenses?.total}>
        <h4>Transportation</h4>
        <div class="responsive-table">
          <table class="table--bordered">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Round Trip</th>
                <th class='text-align--right'>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(this._transportationExpenses?.expenses || []).map(expense => html`
                <tr>
                  <td>
                    <div>${expense.categoryLabel}</div>
                    <div ?hidden=${!expense.estimatedMiles} class='small grey'>Estimated Miles: ${expense.estimatedMiles}</div>
                  </td>
                  <td>${expense.from}</td>
                  <td>${expense.to}</td>
                  <td>${expense.oneWay ? 'No' : 'Yes'}</td>
                  <td class='text-align--right'><span class='monospace-number'>$${expense.amountString}</span></td>
                </tr>
              `)}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  </div>
`;}

/**
 * @description render a basic field
 * @param {String} label - label for field
 * @param {String} value - value for field
 * @param {String} fallback - fallback value if value is not set. 'hide' will hide the field completely.
 * @returns
 */
function renderBasicField(label, value, fallback='hide') {
  value = value || fallback;
  const hidden = value === 'hide';
  return html`
    <div class='u-space-mt--small' ?hidden=${hidden}>
      <div class='primary bold'>${label}</div>
      <div>${value}</div>
    </div>
  `;
}
