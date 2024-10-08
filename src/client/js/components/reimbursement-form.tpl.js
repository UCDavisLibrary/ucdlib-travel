import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import reimbursementExpenses from '../../../lib/utils/reimbursementExpenses.js';
import './character-limit-tracker.js';

export function render() {
  const idPrefix = `reimbursement-form--${this.reimbursementRequest.approval_request_revision_id || 'new'}`;
  return html`
    <form @submit=${this._onSubmit} ${ref(this.form)}>
      <div class="field-container ${this.validationHandler.errorClass('label')}">
        <label for="${idPrefix}--label">Request Title</label>
        <input
          id="${idPrefix}--label"
          type="text"
          .value=${this.reimbursementRequest.label || ''}
          @input=${e => this._onInput('label', e.target.value)} />
        <div class='small u-space-mt--small'>Not required, but helpful if you need to submit mutiple reimbursement requests.</div>
        <div>${this.validationHandler.renderErrorMessages('label')}</div>
        <character-limit-tracker .value=${this.reimbursementRequest.label} character-limit=100></character-limit-tracker>
      </div>

      <div class="field-container ${this.validationHandler.errorClass('employeeResidence')}">
        <label for="${idPrefix}--employee-residence">Your City of Residence</label>
        <input
          id="${idPrefix}--employee-residence"
          type="text"
          .value=${this.reimbursementRequest.employeeResidence || ''}
          @input=${e => this._onInput('employeeResidence', e.target.value)} />
        <div>${this.validationHandler.renderErrorMessages('employeeResidence')}</div>
        <character-limit-tracker .value=${this.reimbursementRequest.employeeResidence} character-limit=100></character-limit-tracker>
      </div>

      <fieldset ?hidden=${!this.hasTravel}>
        <legend>Dates *</legend>
        <div class='l-2col'>
          <div class='l-first'>
            <div class='field-container ${this.validationHandler.errorClass('travelStart')}'>
              <label for="${idPrefix}--departure-date">Actual Departure Date</label>
              <input
                  id="${idPrefix}--departure-date"
                  type="date"
                  .value=${this.reimbursementRequest.travelStart || ''}
                  @input=${e => this._onInput('travelStart', e.target.value)} />
              <div>${this.validationHandler.renderErrorMessages('travelStart')}</div>
            </div>
          </div>
          <div class='l-second'>
            <div class='field-container ${this.validationHandler.errorClass('travelEnd')}'>
              <label for="${idPrefix}--return-date">Actual Return Date</label>
              <input
                  id="${idPrefix}--return-date"
                  type="date"
                  .value=${this.reimbursementRequest.travelEnd || ''}
                  @input=${e => this._onInput('travelEnd', e.target.value)} />
              <div>${this.validationHandler.renderErrorMessages('travelEnd')}</div>
            </div>
          </div>
        </div>
        <div class='field-container ${this.validationHandler.errorClass('personalTime')}'>
          <label for="${idPrefix}--personal-time">Personal Time</label>
          <textarea
            id="${idPrefix}--personal-time"
            .value=${this.reimbursementRequest.personalTime || ''}
            rows="4"
            @input=${e => this._onInput('personalTime', e.target.value)}></textarea>
          <div class='small u-space-mt--small'>Indicate dates/times (e.g. vacation before or after business travel)</div>
          <div>${this.validationHandler.renderErrorMessages('personalTime')}</div>
          <character-limit-tracker .value=${this.reimbursementRequest.personalTime} character-limit=500></character-limit-tracker>
        </div>
      </fieldset>

      <fieldset class=${this.validationHandler.errorClass('expenses', reimbursementExpenses.transportation.value)}>
        <legend>${reimbursementExpenses.transportation.label}</legend>
        <div>${this.validationHandler.renderErrorMessages('expenses', reimbursementExpenses.transportation.value, 'u-space-mb')}</div>

        ${reimbursementExpenses.transportation.subCategories.map(category => html`
          <div class='u-space-mb'>
            <div class='flex flex--space-between'>
              <div class='field-container u-space-mr--small'>
                <div class='checkbox'>
                  <input
                    id="${idPrefix}--transportation-${category.value}"
                    type="checkbox"
                    .checked=${this.hasExpense(reimbursementExpenses.transportation.value, category.value)}
                    @change=${() => this._onExpenseCategoryToggle(reimbursementExpenses.transportation.value, category.value)} />
                  <label for="${idPrefix}--transportation-${category.value}" class='bold'>${category.label}</label>
                </div>
              </div>
              <a
                title='Add ${category.label} Expense'
                ?hidden=${!this.hasExpense(reimbursementExpenses.transportation.value, category.value)}
                @click=${() => this.addBlankExpense(reimbursementExpenses.transportation.value, category.value)}
                class='icon-link quad'>
                <i class="fa-solid fa-circle-plus"></i>
              </a>
            </div>
            <div class='l-gutter'>
              ${(this.reimbursementRequest.expenses || []).filter(e => e.category === reimbursementExpenses.transportation.value && (e.details || {}).subCategory === category.value).map(expense => html`
                <div class='flex u-space-mb'>
                  <div class='u-space-mr--small'>
                    <a
                      title='Delete ${category.label} Expense'
                      @click=${() => this.deleteExpense(expense)}
                      class='icon-link double-decker'>
                      <i class="fa-solid fa-trash-can"></i>
                    </a>
                  </div>
                  <div class='flex--grow'>${renderTransportationExpenseForm.call(this, expense)}</div>
                </div>
              `)}
            </div>
          </div>
        `)}
      </fieldset>

      <fieldset class=${this.validationHandler.errorClass('expenses', reimbursementExpenses.registrationFee.value)}>
        <legend>${reimbursementExpenses.registrationFee.label}</legend>
        <div>${this.validationHandler.renderErrorMessages('expenses', reimbursementExpenses.registrationFee.value, 'u-space-mb')}</div>
        <div class='flex flex--justify-end'>
          <a class='icon-link' @click=${() => this.addBlankExpense(reimbursementExpenses.registrationFee.value)}>
            <i class="fa-solid fa-circle-plus quad"></i>
            <span>Add Fee</span>
          </a>
        </div>
        <div>
          ${(this.reimbursementRequest.expenses || []).filter(e => e.category === reimbursementExpenses.registrationFee.value).map(expense => html`
            <div class='flex u-space-mb'>
              <div class='u-space-mr--small'>
                <a
                  title='Delete Expense'
                  @click=${() => this.deleteExpense(expense)}
                  class='icon-link double-decker'>
                  <i class="fa-solid fa-trash-can"></i>
                </a>
              </div>
              <div class='flex--grow'>${renderRegistrationFeeForm.call(this, expense)}</div>
            </div>
          `)}
        </div>
      </fieldset>

      <fieldset class=${this.validationHandler.errorClass('expenses', reimbursementExpenses.dailyExpense.value)}>
        <legend>${reimbursementExpenses.dailyExpense.label}</legend>
        <div>${this.validationHandler.renderErrorMessages('expenses', reimbursementExpenses.dailyExpense.value, 'u-space-mb')}</div>

        <div class='flex flex--justify-end'>
          <a class='icon-link' @click=${() => this._onNewDateClick('add')}>
            <i class="fa-solid fa-circle-plus quad"></i>
            <span>Add New Date</span>
          </a>
        </div>

        <div>
          ${this.uniqueDates.map(date => html`
            <div class='flex u-space-mb'>
              <div class='u-space-mr--small'>
                <a
                  title='Delete Date'
                  @click=${() => this._onDailyExpenseDateDelete(date)}
                  class='icon-link double-decker'>
                  <i class="fa-solid fa-trash-can"></i>
                </a>
              </div>
              <div class='flex--grow'>
                <div class='field-container'>
                  <label>Date</label>
                  <input
                    type="date"
                    .value=${date}
                    @input=${e => this._onDailyExpenseDateInput(date, e.target.value)} />
                </div>
                <div class='flex flex--space-between flex--wrap u-space-mb--small'>
                  <label>Expenses</label>
                  <a class='icon-link' @click=${() => this.addBlankExpense(reimbursementExpenses.dailyExpense.value, null, date)}>
                    <i class="fa-solid fa-circle-plus quad"></i>
                    <span>Add New Expense</span>
                  </a>
                </div>
                <div>
                  ${this.reimbursementRequest.expenses.filter(e => e.category === reimbursementExpenses.dailyExpense.value && e.date === date).map(expense => html`
                    <div class='flex u-space-mb'>
                      <div class='u-space-mr--small'>
                        <a
                          title='Delete Expense'
                          @click=${() => this.deleteExpense(expense)}
                          class='icon-link double-decker'>
                          <i class="fa-solid fa-trash-can"></i>
                        </a>
                      </div>
                      <div class='flex--grow'>${renderDailyExpenseForm.call(this, expense)}</div>
                    </div>
                  `)}
                </div>
                <div class='field-container'>
                  <label for="${idPrefix}--daily-expense-${date}--notes">Comments</label>
                  <textarea
                    id="${idPrefix}--daily-expense-${date}--notes"
                    .value=${this.dateComments[date] || ''}
                    rows="4"
                    @input=${e => this._setObjectProperty(this.dateComments, date, e.target.value)}></textarea>
                  <character-limit-tracker .value=${this.dateComments[date] || ''} character-limit=500></character-limit-tracker>
                </div>
              </div>
            </div>
          `)}
        </div>

        <div class='flex u-space-mb' ?hidden=${!this.showNewDate}>
          <div class='u-space-mr--small'>
            <a
              title='Delete Date'
              @click=${() => this._onNewDateClick('remove')}
              class='icon-link double-decker'>
              <i class="fa-solid fa-trash-can"></i>
            </a>
          </div>
          <div class='flex--grow'>
            <div class='field-container'>
              <label for="${idPrefix}--daily-expense-new-date">Date</label>
              <input
                ${ref(this.newDateInput)}
                id="${idPrefix}--daily-expense-new-date"
                type="date"
                .value=${this.newDate}
                @input=${this._onNewDateInput} />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class=${this.validationHandler.errorClass('receipts')}>
        <legend>Receipts</legend>
        <div>${unsafeHTML(this.receiptDescription)}</div>
        <div>${this.validationHandler.renderErrorMessages('receipts', null, 'u-space-mb')}</div>
        <div class='flex flex--justify-end'>
          <a class='icon-link' @click=${() => this.addBlankReceipt()}>
            <i class="fa-solid fa-circle-plus quad"></i>
            <span>Add Receipt</span>
          </a>
        </div>
        <div>
          ${(this.reimbursementRequest.receipts).map(receipt => html`
            <div class='flex u-space-mb'>
              <div class='u-space-mr--small'>
                <a
                  title='Delete Receipt'
                  @click=${() => this.deleteReceipt(receipt)}
                  class='icon-link double-decker'>
                  <i class="fa-solid fa-trash-can"></i>
                </a>
              </div>
              <div class='flex--grow'>
                ${renderReceiptForm.call(this, receipt)}
              </div>
            </div>
            `)}
        </div>
      </fieldset>

      <fieldset class='expense-comparison'>
        <legend>Expense Comparison</legend>
        <div class='l-2col l-2col--75-25 u-space-mb--small'>
          <div class='l-second'>
            <span>Approved Projected Expenses</span>
          </div>
          <div class='l-first amount'><span class='monospace-number'>+ $${this.approvedExpenses}</span></div>
        </div>
        <div class='l-2col l-2col--75-25 u-space-mb--small'>
          <div class='l-second'>
            <span ?hidden=${!this.hasOtherTotalExpenses}>This Reimbursement Request</span>
            <span ?hidden=${this.hasOtherTotalExpenses}>Reimbursement Requested</span>
          </div>
          <div class='l-first amount'><span class='monospace-number'>- $${this.totalExpenses}</span></div>
        </div>
        <div class='l-2col l-2col--75-25 u-space-mb--small' ?hidden=${!this.hasOtherTotalExpenses}>
          <div class='l-second'>
            <span>Previously Submitted Reimbursement Requests</span>
          </div>
          <div class='l-first amount'><span class='monospace-number'>- $${this.otherTotalExpenses}</span></div>
        </div>
        <div class='l-2col l-2col--75-25 u-space-mb--small total-row'>
          <div class='l-second'>
            <span class='primary monospace-number'>Remaining Approved Projected Expenses</span>
          </div>
          <div class='l-first amount ${this.netExpensesNegative ? 'double-decker' : 'quad'}'>
            <span class='monospace-number'>${this.netExpensesNegative ? '-' : '+'} $${this.netExpenses}</span>
          </div>
        </div>
        <div ?hidden=${!(this.netExpensesNegative && this.netExpensesNegativeWarningMessage)}>
          <div class="brand-textbox category-brand__background category-brand--double-decker u-space-mt">
            <span>${unsafeHTML(this.netExpensesNegativeWarningMessage)}</span>
          </div>
        </div>
      </fieldset>

      <div class='field-container ${this.validationHandler.errorClass('comments')}'>
        <label for="${idPrefix}--comments">Comments</label>
        <textarea
          id="${idPrefix}--comments"
          .value=${this.reimbursementRequest.comments || ''}
          rows="4"
          @input=${e => this._onInput('comments', e.target.value)}></textarea>
        <div>${this.validationHandler.renderErrorMessages('comments')}</div>
        <character-limit-tracker .value=${this.reimbursementRequest.comments} character-limit=500></character-limit-tracker>
      </div>

      <div class='form-buttons alignable-promo__buttons'>
        <button
          type="submit"
          class='btn btn--primary'
          >Submit</button>
      </div>
    </form>


  `;}

function renderExpenseReceiptLink(expense){
  const receiptRecord = this.reimbursementRequest.receipts.find(r => r.expenseNonce === expense.nonce);
  return html`
    <a class='icon-link' @click=${() => this.goToExpenseReceipt(expense)}>
      <i class="fa-solid fa-file-lines"></i>
      <span>${receiptRecord ? 'View Receipt' : 'Upload Receipt'}</span>
    </a>
  `;
}

function renderReceiptForm(receipt){
  const nonce = receipt.nonce || receipt.reimbursementRequestReceiptId;
  const expense = this.reimbursementRequest.expenses.find(e => e.nonce === receipt.expenseNonce);
  const idPrefix = `reimbursement-form-receipt--${nonce}`;
  return html`
    <div>
      <div class='field-container'>
        <label for="${idPrefix}--file">File</label>
        <input
          id="${idPrefix}--file"
          name='receiptUploads'
          type="file"
          @change=${e => this._onReceiptFileChange(receipt, e.target.files[0])} />
      </div>
      <div class='field-container'>
        <label for="${idPrefix}--label">Receipt Label</label>
        <input
          id="${idPrefix}--label"
          type="text"
          .value=${receipt.label || ''}
          @input=${e => this._setObjectProperty(receipt, 'label', e.target.value)} />
        <character-limit-tracker .value=${receipt.label} character-limit=200></character-limit-tracker>
      </div>
      <div class='field-container'>
        <label for="${idPrefix}--description">Receipt Description (optional)</label>
        <textarea
          id="${idPrefix}--description"
          .value=${receipt.description || ''}
          rows="4"
          @input=${e => this._setObjectProperty(receipt, 'description', e.target.value)}></textarea>
        <character-limit-tracker .value=${receipt.description} character-limit=500></character-limit-tracker>
      </div>
      <div ?hidden=${!expense}>
        <a class='pointer' @click=${() => this.goToExpenseAmountInput(expense)}>Go to associated expense</a>
      </div>
    </div>
  `;
}

function renderDailyExpenseForm(expense){
  const nonce = expense.nonce || expense.reimbursementRequestExpenseId;
  const idPrefix = `reimbursement-form-expense--${nonce}`;
  return html`
    <div>
      <div class='l-2col'>
        <div class='l-first'>
          <div class='field-container'>
            <label for="${idPrefix}--amount">Amount *</label>
            <div class='amount input--dollar width-100'>
              <input
                id="${idPrefix}--amount"
                type="number"
                step="0.01"
                .value=${expense.amount}
                @input=${e => this._setObjectProperty(expense, 'amount', Number(e.target.value))} />
            </div>
          </div>

        </div>
        <div class='l-second'>
          <div class='field-container'>
            <label for="${idPrefix}--type">Type</label>
            <select
              .value=${expense.details?.subCategory || ''}
              @change=${e => this._setObjectProperty(expense.details, 'subCategory', e.target.value)}
            >
              <option value="" ?selected=${!expense?.details?.subCategory}>Select an expense type</option>
              ${reimbursementExpenses.dailyExpense.subCategories.filter(sc => !sc.hideFromSelect).map(subCategory => html`
                <option
                  value="${subCategory.value}"
                  ?selected=${expense?.details?.subCategory === subCategory.value}
                  >${subCategory.label}</option>
                `)}
            </select>
          </div>
        </div>
      </div>
      ${renderExpenseReceiptLink.call(this, expense)}
    </div>

    `;
}

/**
 * @description Render the registration fee form
 * @param {Object} expense - the expense object from the reimbursementRequest.expenses array
 * @returns
 */
function renderRegistrationFeeForm(expense){
  const nonce = expense.nonce || expense.reimbursementRequestExpenseId;
  const idPrefix = `reimbursement-form-expense--${nonce}`;
  return html`
    <div class='l-2col l-2col--33-67'>
      <div class='l-first'>
        <div class='field-container'>
          <label for="${idPrefix}--amount">Amount *</label>
          <div class='amount input--dollar width-100'>
            <input
              id="${idPrefix}--amount"
              step="0.01"
              type="number"
              .value=${expense.amount}
              @input=${e => this._setObjectProperty(expense, 'amount', Number(e.target.value))} />
          </div>
        </div>

      </div>
      <div class='l-second'>
        <div class='field-container'>
          <label for="${idPrefix}--name">Fee Type *</label>
          <input
            id="${idPrefix}--name"
            type="text"
            .value=${expense.details.name || ''}
            @input=${e => this._setObjectProperty(expense.details, 'name', e.target.value)} />
        </div>
      </div>
    </div>
    ${renderExpenseReceiptLink.call(this, expense)}
  `;
}


/**
 * @description Render an individual transportation expense form
 * @param {Object} expense - the expense object from the reimbursementRequest.expenses array
 * @returns {TemplateResult}
 */
function renderTransportationExpenseForm(expense){
  const subCategory = (expense?.details || {}).subCategory;
  if ( !subCategory ) return html``;
  const nonce = expense.nonce || expense.reimbursementRequestExpenseId;
  const idPrefix = `reimbursement-form-expense--${nonce}`;

  const roundTripRadioButtons = html`
    <div class='radio radio--horizontal'>
      <div>
        <input
          id="${idPrefix}--round-trip"
          type="radio"
          .checked=${!expense.details.oneWay}
          @input=${e => this._setObjectProperty(expense.details, 'oneWay', false)} />
        <label for="${idPrefix}--round-trip">Round Trip</label>
      </div>
      <div>
        <input
          id="${idPrefix}--one-way"
          type="radio"
          .checked=${expense.details.oneWay}
          @input=${e => this._setObjectProperty(expense.details, 'oneWay', true)} />
        <label for="${idPrefix}--one-way">One Way</label>
      </div>
    </div>
  `;

  const addressFields = html`
    <div class='l-2col'>
      <div class='l-first'>
        <div class='field-container'>
          <label for="${idPrefix}--from">
            <span ?hidden=${subCategory !== 'private-car'}>From (Street Address) *</span>
            <span ?hidden=${subCategory === 'private-car'}>From *</span>
          </label>
          <input
            id="${idPrefix}--from"
            type="text"
            .value=${expense.details.from || ''}
            @input=${e => this._setObjectProperty(expense.details, 'from', e.target.value)} />
        </div>
      </div>
      <div class='l-second'>
        <div class='field-container'>
          <label for="${idPrefix}--to">
            <span ?hidden=${subCategory !== 'private-car'}>To (Street Address) *</span>
            <span ?hidden=${subCategory === 'private-car'}>To *</span>
          </label>
          <input
            id="${idPrefix}--to"
            type="text"
            .value=${expense.details.to || ''}
            @input=${e => this._setObjectProperty(expense.details, 'to', e.target.value)} />
        </div>
      </div>
    </div>
  `;

  const amountField = html`
    <div class='field-container'>
      <label for="${idPrefix}--amount">Amount *</label>
      <div class='amount input--dollar'>
        <input
          id="${idPrefix}--amount"
          type="number"
          step="0.01"
          .value=${expense.amount}
          @input=${e => this._setObjectProperty(expense, 'amount', Number(e.target.value))} />
      </div>
    </div>
  `;

  if ( subCategory === 'private-car' ){
    const milesId = `${idPrefix}--estimated-miles`;
    return html`
      <div>
        ${roundTripRadioButtons}
        ${addressFields}
        <div class='l-2col'>
          <div class='l-first'>
            <div class='field-container'>
              <label for=${milesId}>Estimated Miles *</label>
              <input
                id=${milesId}
                type="number"
                .value=${expense.details?.estimatedMiles || ''}
                @input=${e => this._onPersonalCarMileageInput(expense, e.target.value)} />
            </div>
          </div>
          <div class='l-second'>
            <div class='field-container'>
              <label for="${idPrefix}--amount">Estimated Amount</label>
              <div class='amount input--dollar width-100'>
                <input
                  id="${idPrefix}--amount"
                  type="number"
                  step="0.01"
                  .value=${expense.amount}
                  disabled />
              </div>
            </div>
          </div>
        </div>
        ${renderExpenseReceiptLink.call(this, expense)}
      </div>
    `;
  }

  if ( subCategory === 'airfare-train' ){
    return html`
      <div>
        ${amountField}
        <div class='u-space-pt--small'>
          ${roundTripRadioButtons}
          ${addressFields}
        </div>
        ${renderExpenseReceiptLink.call(this, expense)}
      </div>
    `;
  }

  if ( subCategory === 'rental-car' ){
    return html`
      <div>
        ${amountField}
        <div class='u-space-pt--small'>
          ${roundTripRadioButtons}
          ${addressFields}
        </div>
        ${renderExpenseReceiptLink.call(this, expense)}
      </div>
    `;
  }
  return html``;
}
