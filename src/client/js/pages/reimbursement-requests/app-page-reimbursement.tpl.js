import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ref } from 'lit/directives/ref.js';

import '../../components/approval-request-header.js';
import typeTransform from '../../../../lib/utils/typeTransform.js';
import reimbursmentExpenses from '../../../../lib/utils/reimbursmentExpenses.js';
import applicationOptions from '../../../../lib/utils/applicationOptions.js';

export function render() {
return html`
  <approval-request-header .approvalRequest=${this.approvalRequest} class='u-space-mb--large'></approval-request-header>
  <div class='l-gutter u-space-mb--large'>
    <div class='l-basic--flipped u-space-mb'>
      <div class='l-content'>
        <div>
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

    ${renderStatusSection.call(this)}

    <div class='u-space-mb--large'>
      <h3>Line Item Expenses</h3>
      ${renderTransportationExpenses.call(this)}
      ${renderRegistrationExpenses.call(this)}
      ${renderDailyExpenses.call(this)}
      ${renderTotalExpenses.call(this)}
    </div>

    ${renderReceipts.call(this)}


  </div>
`;}

/**
 * @description Render the status section
 * @returns {TemplateResult}
 */
function renderStatusSection() {
  return html`
    <div class='u-space-mb--large'>
      <h3 class='u-space-mb--flush'>Reimbursement Status</h3>
      <div>

        <div ?hidden=${this.reimbursementRequest?.fundTransactions?.length} class='u-space-mb'>
          <div>${unsafeHTML(this._noFundTransactionsText)}</div>
        </div>

        <div ?hidden=${!this.reimbursementRequest?.fundTransactions?.length}>
          table of aggie expense transactions goes here
        </div>

        <div ?hidden=${!this.AuthModel.isSiteAdmin}>
          <a class='icon-link' @click=${() => this._onEditFundTransactionClicked()}>
            <i class="fa-solid fa-circle-plus quad"></i>
            <span>Add New Aggie Expense Entry</span>
          </a>
        </div>
      </div>
      <dialog ${ref(this.statusDialogRef)}>
        <div class='u-space-mb'>
          <h4 ?hidden=${this.statusFormData?.reimbursementRequestFundId}>New Aggie Expense Entry</h4>
          <h4 ?hidden=${!this.statusFormData?.reimbursementRequestFundId}>Edit Aggie Expense Entry</h4>
        </div>
        <form @submit=${this._onStatusDialogFormSubmit}>
          <div>
            <div class='l-2col'>
              <div class="l-first">
                <div class='field-container ${this.statusFormValidation.errorClass('approvalRequestFundingSourceId')}'>
                  <label>Funding Source</label>
                  <select
                    .value=${this.statusFormData?.approvalRequestFundingSourceId || ''}
                    @input=${e => this._onStatusDialogFormInput('approvalRequestFundingSourceId', e.target.value, 'int')}>
                    <option value='' disabled>Select a funding source</option>
                    ${(this.approvalRequest?.fundingSources || []).map(source => html`
                      <option
                        .value=${source.fundingSourceId}
                        ?selected=${this.statusFormData?.approvalRequestFundingSourceId === source.approvalRequestFundingSourceId}
                        >${source.fundingSourceLabel}</option>
                      `)}
                  </select>
                  ${this.statusFormValidation.renderErrorMessages('approvalRequestFundingSourceId')}
                </div>
              </div>
              <div class='l-second'>
                <div class='field-container ${this.statusFormValidation.errorClass('accountingCode')}'>
                  <label>Accounting Code</label>
                  <input
                    type='text'
                    .value=${this.statusFormData?.accountingCode || ''}
                    @input=${e => this._onStatusDialogFormInput('accountingCode', e.target.value)}>
                  ${this.statusFormValidation.renderErrorMessages('accountingCode')}
                </div>
              </div>
            </div>
            <div class='l-2col'>
              <div class='l-first'>
                <div class='field-container ${this.statusFormValidation.errorClass('amount')}'>
                  <label>Amount</label>
                  <div class='amount input--dollar width-100'>
                    <input
                      type='number'
                      step="0.01"
                      .value=${this.statusFormData?.amount || ''}
                      @input=${e => this._onStatusDialogFormInput('amount', e.target.value, 'number')}>
                  </div>
                  ${this.statusFormValidation.renderErrorMessages('amount')}
                </div>
              </div>
              <div class='l-second'>
                <div class='field-container ${this.statusFormValidation.errorClass('status')}'>
                  <label>Status</label>
                  <select
                    .value=${this.statusFormData?.reimbursementStatus || ''}
                    @input=${e => this._onStatusDialogFormInput('reimbursementStatus', e.target.value)}>
                    <option value='' disabled>Select a status</option>
                    ${applicationOptions.reimbursementTransactionStatuses.map(option => html`
                      <option
                        .value=${option.value}
                        ?selected=${this.statusFormData?.reimbursementStatus === option.value}
                        >${option.labelShort}</option>
                      `)}
                  </select>
                  ${this.statusFormValidation.renderErrorMessages('reimbursementStatus')}
                </div>
              </div>
            </div>
          </div>
          <div class='alignable-promo__buttons u-space-mt flex'>
            <div class='category-brand--secondary'>
              <button
                class='btn btn--primary'
                type='submit'
                @click=${() => this._onStatusDialogButtonClicked('submit')} >
                ${this.statusFormData?.reimbursementRequestFundId ? 'Save' : 'Submit'}
              </button>
            </div>
            <div class='category-brand--secondary'>
              <button
                class='btn btn--invert'
                type='button'
                @click=${() => this._onStatusDialogButtonClicked('cancel')} >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </dialog>
    </div>
  `;
}

/**
 * @description Render the transportation expenses table
 * @returns {TemplateResult}
 */
function renderTransportationExpenses() {
  return html`
    <div ?hidden=${!this._transportationExpenses?.total}>
      <h4>${this._transportationExpenses.label}</h4>
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
          <tfoot>
            <tr>
              <th>Total</th>
              <th></th>
              <th></th>
              <th></th>
              <th class='text-align--right'><span class='monospace-number'>$${this._transportationExpenses.totalString}</span></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
}

/**
 * @description Render the registration expenses table
 * @returns {TemplateResult}
 */
function renderRegistrationExpenses(){
  return html`
    <div ?hidden=${!this._registrationExpenses?.total}>
      <h4>${this._registrationExpenses.label}</h4>
      <div class="responsive-table">
        <table class="table--bordered registration-fees">
          <thead>
            <tr>
              <th>Fee Type</th>
              <th class='text-align--right'>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(this._registrationExpenses?.expenses || []).map(expense => html`
              <tr>
                <td>${expense.name}</td>
                <td class='text-align--right'><span class='monospace-number'>$${expense.amountString}</span></td>
              </tr>
            `)}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th class='text-align--right'><span class='monospace-number'>$${this._registrationExpenses.totalString}</span></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
}

/**
 * @description Render the daily expenses table
 * @returns {TemplateResult}
 */
function renderDailyExpenses(){
  return html`
    <div ?hidden=${!this._dailyExpenses?.total}>
      <h4>${this._dailyExpenses.label}</h4>
      <div class="responsive-table">
        <table class="table--bordered daily-expenses">
          <thead>
            <tr>
              <th></th>
              <th colspan='3' class='text-align--center'>Meals</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            <tr>
              <th>Date</th>
              <th class='text-align--right'>Breakfast</th>
              <th class='text-align--right'>Lunch</th>
              <th class='text-align--right'>Dinner</th>
              <th class='text-align--right'>Lodging</th>
              <th class='text-align--right'>Misc</th>
              <th class='text-align--right'>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${this._dailyExpenses?.dates.map(date => html`
              <tr>
                <td>${date.date}</td>
                ${date.expenses.map(expense => html`
                  <td class='text-align--right monospace-number'>$${expense.amountString}</td>`
                )}
                <td class='text-align--right monospace-number'>$${date.totalString}</td>
                <td class='text-align--right'>
                  <a class='icon-link' title='View notes' ?hidden=${!date.notes} @click=${() => this._onDailyExpenseNotesClicked(date)}><i class='fas fa-comment'></i></a>
                </td>
              </tr>
            `)}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              ${this._dailyExpenses?.subCategories.map(subCategory => html`
                <td class='text-align--right monospace-number'>$${subCategory.amountString}</td>`
              )}
              <td class='text-align--right monospace-number'>$${this._dailyExpenses.totalString}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
}

/**
 * @description Render the total expenses table
 * @returns {TemplateResult}
 */
function renderTotalExpenses(){
  return html`
    <div>
      <h4>Total Expenses</h4>
      <div class="responsive-table">
        <table class="table--bordered total-expenses">
          <thead>
            <tr>
              <th>Category</th>
              <th class='text-align--right'>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${this._transportationExpenses.label}</td>
              <td class='text-align--right monospace-number'>$${this._transportationExpenses.totalString}</td>
            </tr>
            <tr>
              <td>${this._registrationExpenses.label}</td>
              <td class='text-align--right monospace-number'>$${this._registrationExpenses.totalString}</td>
            </tr>
            <tr>
              <td>${this._dailyExpenses.label}</td>
              <td class='text-align--right monospace-number'>$${this._dailyExpenses.totalString}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th class='text-align--right monospace-number'>$${reimbursmentExpenses.addExpenses(this.reimbursementRequest?.expenses || [])}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

/**
 * @description Render the receipts section
 * @returns {TemplateResult}
 */
function renderReceipts(){
  return html`
    <div ?hidden=${!(this.reimbursementRequest?.receipts || []).length}>
      <h3>Receipts</h3>
      ${(this.reimbursementRequest?.receipts || []).map(receipt => html`
        <div class='flex u-space-mb'>
          <div class='u-space-mr--small primary'>
            <i class='fas fa-file-lines'></i>
          </div>
          <div class='flex--grow'>
            <div>
              <a class='underline-hover primary' href=${receipt.filePath}>
                <span class='bold'>${receipt.label || 'Untitled Receipt'}</span>
                <span>(${receipt.fileType})</span>
              </a>
            </div>
            <div class='small' ?hidden=${!receipt.description}>${receipt.description}</div>
          </div>
        </div>
      `)}
    </div>
  `;
}

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
