import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import reimbursmentExpenses from '../../../lib/utils/reimbursmentExpenses.js';

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
      </div>

      <div class="field-container ${this.validationHandler.errorClass('employeeResidence')}">
        <label for="${idPrefix}--employee-residence">Your City of Residence</label>
        <input
          id="${idPrefix}--employee-residence"
          type="text"
          .value=${this.reimbursementRequest.employee_residence || ''}
          @input=${e => this._onInput('employeeResidence', e.target.value)} />
        <div>${this.validationHandler.renderErrorMessages('employeeResidence')}</div>
      </div>

      <fieldset>
        <legend>Dates *</legend>
        <div class='l-2col u-space-mb ${this.validationHandler.errorClass('travelStart')}'>
          <div class='l-first'>
            <div class='field-container'>
              <label for="${idPrefix}--departure-date">Departure Date</label>
              <input
                id="${idPrefix}--departure-date"
                type="date"
                .value=${this.getDate('travelStart')}
                @input=${e => this._onDateInput('travelStart', e.target.value)} />
            </div>
          </div>
          <div class='l-second'>
            <div class='field-container'>
              <label for="${idPrefix}--departure-time">Departure Time</label>
              <input
                id="${idPrefix}--departure-time"
                type="time"
                .value=${this.getTime('travelStart')}
                @input=${e => this._onTimeInput('travelStart', e.target.value)} />
            </div>
          </div>
        </div>
        <div>${this.validationHandler.renderErrorMessages('travelStart')}</div>

        <div class='l-2col u-space-mb ${this.validationHandler.errorClass('travelEnd')}'>
          <div class='l-first'>
            <div class='field-container'>
              <label for="${idPrefix}--return-date">Return Date</label>
              <input
                id="${idPrefix}--return-date"
                type="date"
                .value=${this.getDate('travelEnd')}
                @input=${e => this._onDateInput('travelEnd', e.target.value)} />
            </div>
          </div>
          <div class='l-second'>
            <div class='field-container'>
              <label for="${idPrefix}--return-time">Return Time</label>
              <input
                id="${idPrefix}--return-time"
                type="time"
                .value=${this.getTime('travelEnd')}
                @input=${e => this._onTimeInput('travelEnd', e.target.value)} />
            </div>
          </div>
        </div>
        <div>${this.validationHandler.renderErrorMessages('travelEnd')}</div>

        <div class='field-container ${this.validationHandler.errorClass('personalTime')}'>
          <label for="${idPrefix}--personal-time">Personal Time</label>
          <textarea
            id="${idPrefix}--personal-time"
            .value=${this.reimbursementRequest.personalTime || ''}
            rows="4"
            @input=${e => this._onInput('personalTime', e.target.value)}></textarea>
          <div class='small u-space-mt--small'>Indicate dates/times (e.g. vacation before or after business travel)</div>
          <div>${this.validationHandler.renderErrorMessages('personalTime')}</div>
        </div>
      </fieldset>

      <fieldset class=${this.validationHandler.errorClass('expenses', reimbursmentExpenses.transportation.value)}>
        <legend>${reimbursmentExpenses.transportation.label}</legend>
        <div>${this.validationHandler.renderErrorMessages('expenses', reimbursmentExpenses.transportation.value)}</div>

        ${reimbursmentExpenses.transportation.subCategories.map(category => html`
          <div class='u-space-mb'>
            <div class='flex flex--space-between'>
              <div class='field-container u-space-mr--small'>
                <div class='checkbox'>
                  <input
                    id="${idPrefix}--transportation-${category.value}"
                    type="checkbox"
                    .checked=${this.hasExpense(reimbursmentExpenses.transportation.value, category.value)}
                    @change=${() => this._onExpenseCategoryToggle(reimbursmentExpenses.transportation.value, category.value)} />
                  <label for="${idPrefix}--transportation-${category.value}" class='bold'>${category.label}</label>
                </div>
              </div>
              <a
                title='Add ${category.label} Expense'
                ?hidden=${!this.hasExpense(reimbursmentExpenses.transportation.value, category.value)}
                @click=${() => this.addBlankExpense(reimbursmentExpenses.transportation.value, category.value)}
                class='icon-link quad'>
                <i class="fa-solid fa-circle-plus"></i>
              </a>
            </div>
            <div class='l-gutter'>
              ${(this.reimbursementRequest.expenses || []).filter(e => e.category === reimbursmentExpenses.transportation.value && (e.details || {}).subCategory === category.value).map(expense => html`
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

      <fieldset class=${this.validationHandler.errorClass('expenses', reimbursmentExpenses.registrationFee.value)}>
        <legend>${reimbursmentExpenses.registrationFee.label}</legend>
        <div>${this.validationHandler.renderErrorMessages('expenses', reimbursmentExpenses.registrationFee.value)}</div>
        <div class='flex flex--justify-end'>
          <a class='icon-link' @click=${() => this.addBlankExpense(reimbursmentExpenses.registrationFee.value)}>
            <i class="fa-solid fa-circle-plus quad"></i>
            <span>Add Fee</span>
          </a>
        </div>
        <div>
          ${(this.reimbursementRequest.expenses || []).filter(e => e.category === reimbursmentExpenses.registrationFee.value).map(expense => html`
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

      <fieldset class=${this.validationHandler.errorClass('expenses', reimbursmentExpenses.dailyExpense.value)}>
        <legend>${reimbursmentExpenses.dailyExpense.label}</legend>
        <div>${this.validationHandler.renderErrorMessages('expenses', reimbursmentExpenses.dailyExpense.value)}</div>

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
                  <a class='icon-link' @click=${() => this.addBlankExpense(reimbursmentExpenses.dailyExpense.value, null, date)}>
                    <i class="fa-solid fa-circle-plus quad"></i>
                    <span>Add New Expense</span>
                  </a>
                </div>
                <div>
                  ${this.reimbursementRequest.expenses.filter(e => e.category === reimbursmentExpenses.dailyExpense.value && e.date === date).map(expense => html`
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
        <div>${this.validationHandler.renderErrorMessages('receipts')}</div>
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

      <div class='form-buttons alignable-promo__buttons'>
        <button
          type="submit"
          class='btn btn--primary'
          >Submit</button>
      </div>
    </form>


  `;}

function renderReceiptForm(receipt){
  const nonce = receipt.nonce || receipt.reimbursementRequestReceiptId;
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
      </div>
      <div class='field-container'>
        <label for="${idPrefix}--description">Receipt Description</label>
        <textarea
          id="${idPrefix}--description"
          .value=${receipt.description || ''}
          rows="4"
          @input=${e => this._setObjectProperty(receipt, 'description', e.target.value)}></textarea>
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
              ${reimbursmentExpenses.dailyExpense.subCategories.filter(sc => !sc.hideFromSelect).map(subCategory => html`
                <option
                  value="${subCategory.value}"
                  ?selected=${expense?.details?.subCategory === subCategory.value}
                  >${subCategory.label}</option>
                `)}
            </select>
          </div>
        </div>
      </div>
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
          <label for="${idPrefix}--name">Name *</label>
          <input
            id="${idPrefix}--name"
            type="text"
            .value=${expense.details.name || ''}
            @input=${e => this._setObjectProperty(expense.details, 'name', e.target.value)} />
        </div>
      </div>
    </div>
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
          id="${idPrefix}--${subCategory}--round-trip"
          type="radio"
          .checked=${!expense.details.oneWay}
          @input=${e => this._setObjectProperty(expense.details, 'oneWay', false)} />
        <label for="${idPrefix}--${subCategory}--round-trip">Round Trip</label>
      </div>
      <div>
        <input
          id="${idPrefix}--${subCategory}--one-way"
          type="radio"
          .checked=${expense.details.oneWay}
          @input=${e => this._setObjectProperty(expense.details, 'oneWay', true)} />
        <label for="${idPrefix}--${subCategory}--one-way">One Way</label>
      </div>
    </div>
  `;

  const addressFields = html`
    <div class='l-2col'>
      <div class='l-first'>
        <div class='field-container'>
          <label for="${idPrefix}--${subCategory}--from">
            <span ?hidden=${subCategory !== 'private-car'}>From (Street Address) *</span>
            <span ?hidden=${subCategory === 'private-car'}>From *</span>
          </label>
          <input
            id="${idPrefix}--${subCategory}--from"
            type="text"
            .value=${expense.details.from || ''}
            @input=${e => this._setObjectProperty(expense.details, 'from', e.target.value)} />
        </div>
      </div>
      <div class='l-second'>
        <div class='field-container'>
          <label for="${idPrefix}--${subCategory}--to">
            <span ?hidden=${subCategory !== 'private-car'}>To (Street Address) *</span>
            <span ?hidden=${subCategory === 'private-car'}>To *</span>
          </label>
          <input
            id="${idPrefix}--${subCategory}--to"
            type="text"
            .value=${expense.details.to || ''}
            @input=${e => this._setObjectProperty(expense.details, 'to', e.target.value)} />
        </div>
      </div>
    </div>
  `;

  const amountField = html`
    <div class='field-container'>
      <label for="${idPrefix}--${subCategory}--amount">Amount *</label>
      <div class='amount input--dollar'>
        <input
          id="${idPrefix}--${subCategory}--amount"
          type="number"
          step="0.01"
          .value=${expense.amount}
          @input=${e => this._setObjectProperty(expense, 'amount', Number(e.target.value))} />
      </div>
    </div>
  `;

  if ( subCategory === 'private-car' ){
    return html`
      <div>
        ${roundTripRadioButtons}
        ${addressFields}
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
      </div>
    `;
  }
  return html``;
}
