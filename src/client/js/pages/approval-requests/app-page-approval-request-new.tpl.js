import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() {
return html`
  <div class='l-gutter u-space-mb--large'>
    <div class='l-basic--flipped'>
      <div class ='l-content'>
        <p ?hidden=${this.userCantSubmit}>${unsafeHTML(this.SettingsModel.getByKey('approval_request_form_intro'))}</p>
        <div ?hidden=${!this.userCantSubmit} class='alert alert--warning'>
          This form cannot be submitted because either:
          <div class='u-space-px--large'>
            <ul>
              <li>This approval request has already been submitted.</li>
              <li>You are not the original submitter of this request.</li>
            </ul>
          </div>
        </div>
        ${renderForm.call(this)}
      </div>
      <div class='l-sidebar-second'>
      </div>
    </div>
  </div>
`;}

export function renderForm(){
  const page = 'app-page-approval-request-new';

  return html`
    <form class='skinny-form approval-request-form'>
      <div class="field-container ${this.validationHandler.errorClass('label')}">
        <label for="${page}--label">Title of Trip, Training, or Professional Development Opportunity <abbr title="Required">*</abbr></label>
        <input
          type="text"
          .value=${this.approvalRequest.label || ''}
          id="${page}--label"
          @input=${e => this._onFormInput('label', e.target.value)}
          >
          <div>${this.validationHandler.renderErrorMessages('label')}</div>
      </div>

      <div class="field-container ${this.validationHandler.errorClass('organization')}">
        <label for="${page}--organization">Organization <abbr title="Required">*</abbr></label>
        <input
          type="text"
          .value=${this.approvalRequest.organization || ''}
          id="${page}--organization"
          @input=${e => this._onFormInput('organization', e.target.value)}
          >
          <div>${this.validationHandler.renderErrorMessages('organization')}</div>
      </div>

      <div class="field-container ${this.validationHandler.errorClass('businessPurpose')}">
        <label for="${page}--businessPurpose">Business Purpose <abbr title="Required">*</abbr></label>
        <textarea
          id="${page}--businessPurpose"
          rows="5"
          .value=${this.approvalRequest.businessPurpose || ''}
          @input=${e => this._onFormInput('businessPurpose', e.target.value)}
          ></textarea>
          <div>${this.validationHandler.renderErrorMessages('businessPurpose')}</div>
      </div>

      <div class="field-container ${this.validationHandler.errorClass('location')}">
        <label>Location <abbr title="Required">*</abbr></label>
        <div class='radio'>
          <div>
            <input
              id="${page}--location--in-state"
              type="radio"
              name="${page}--location"
              .checked=${this.approvalRequest.location === 'in-state'}
              @change=${e => this._onFormInput('location', 'in-state')}
            >
            <label for="${page}--location--in-state">In-State</label>
          </div>
          <div class='option-description'>
            ${unsafeHTML(this.SettingsModel.getByKey('approval_request_form_location_in-state'))}
          </div>
          <div>
            <input
              id="${page}--location--out-of-state"
              type="radio"
              name="${page}--location"
              .checked=${this.approvalRequest.location === 'out-of-state'}
              @change=${e => this._onFormInput('location', 'out-of-state')}
            >
            <label for="${page}--location--out-of-state">Out-of-State</label>
          </div>
          <div class='option-description'>
            ${unsafeHTML(this.SettingsModel.getByKey('approval_request_form_location_out-of-state'))}
          </div>
          <div>
            <input
              id="${page}--location--foreign"
              type="radio"
              name="${page}--location"
              .checked=${this.approvalRequest.location === 'foreign'}
              @change=${e => this._onFormInput('location', 'foreign')}
            >
            <label for="${page}--location--foreign">Foreign</label>
          </div>
          <div class='option-description'>
            ${unsafeHTML(this.SettingsModel.getByKey('approval_request_form_location_foreign'))}
          </div>
          <div>
            <input
              id="${page}--location--virtual"
              type="radio"
              name="${page}--location"
              .checked=${this.approvalRequest.location === 'virtual'}
              @change=${e => this._onFormInput('location', 'virtual')}
            >
            <label for="${page}--location--virtual">Virtual</label>
          </div>
          <div class='option-description'>
            ${unsafeHTML(this.SettingsModel.getByKey('approval_request_form_location_virtual'))}
          </div>
        </div>
        <div>${this.validationHandler.renderErrorMessages('location')}</div>
      </div>

      <fieldset>
        <legend>Dates *</legend>
        <div class='l-2col'>
          <div class='l-first'>
            <div class="field-container ${this.validationHandler.errorClass('programStartDate')}">
              <label for="${page}--programStartDate">Program Start *</label>
              <input
                id="${page}--programStartDate"
                type="date"
                .value=${this.approvalRequest.programStartDate || ''}
                @input=${e => this._onFormInput('programStartDate', e.target.value)}
                >
                <div>${this.validationHandler.renderErrorMessages('programStartDate')}</div>
            </div>
          </div>
          <div class='l-second'>
            <div class="field-container ${this.validationHandler.errorClass('programEndDate')}">
              <label for="${page}--programEndDate">Program End</label>
              <input
                id="${page}--programEndDate"
                type="date"
                .value=${this.approvalRequest.programEndDate || ''}
                @input=${e => this._onFormInput('programEndDate', e.target.value)}
                >
                <div>${this.validationHandler.renderErrorMessages('programEndDate')}</div>
            </div>
          </div>
        </div>
        <div class='field-container ${this.validationHandler.errorClass('travelRequired')}'>
          <div class='checkbox'>
            <div>
              <input
                id="${page}--travelRequired"
                type="checkbox"
                .checked=${this.approvalRequest.travelRequired}
                @change=${e => this._onFormInput('travelRequired', e.target.checked)}
                >
              <label for="${page}--travelRequired">Travel Required</label>
            </div>
            <div class='option-description'>${unsafeHTML(this.SettingsModel.getByKey('approval_request_form_travel-required'))}</div>
            <div>${this.validationHandler.renderErrorMessages('travelRequired')}</div>
          </div>
        </div>
        <div class='field-container ${this.validationHandler.errorClass('hasCustomTravelDates')}' ?hidden=${!this.approvalRequest.travelRequired}>
          <div class='checkbox'>
            <div>
              <input
                id="${page}--hasCustomTravelDates"
                type="checkbox"
                .checked=${this.approvalRequest.hasCustomTravelDates}
                @change=${e => this._onFormInput('hasCustomTravelDates', e.target.checked)}
                >
              <label for="${page}--hasCustomTravelDates">Custom Travel Dates</label>
            </div>
            <div class='option-description'>${unsafeHTML(this.SettingsModel.getByKey('approval_request_form_custom_travel'))}</div>
            <div>${this.validationHandler.renderErrorMessages('hasCustomTravelDates')}</div>
          </div>
        </div>
        <div class='l-2col' ?hidden=${!this.approvalRequest.travelRequired || !this.approvalRequest.hasCustomTravelDates}>
          <div class='l-first'>
            <div class='field-container ${this.validationHandler.errorClass('travelStartDate')}'>
              <label for='${page}--travelStartDate'>Travel Start *</label>
              <input
                id="${page}--travelStartDate"
                type='date'
                .value=${this.approvalRequest.travelStartDate || ''}
                @change=${e => this._onFormInput('travelStartDate', e.target.value)}
              >
              ${this.validationHandler.renderErrorMessages('travelStartDate')}
            </div>
          </div>
          <div class='l-second'>
            <div class='field-container ${this.validationHandler.errorClass('travelEndDate')}'>
              <label for='${page}--travelEndDate'>Travel End</label>
              <input
                id="${page}--travelEndDate"
                type='date'
                .value=${this.approvalRequest.travelEndDate || ''}
                @change=${e => this._onFormInput('travelEndDate', e.target.value)}
              >
              ${this.validationHandler.renderErrorMessages('travelEndDate')}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Estimated Expenses</legend>
        <div class='field-container ${this.validationHandler.errorClass('noExpenditures')}'>
          <div class='checkbox'>
            <div>
              <input
                id="${page}--noExpenditures"
                type="checkbox"
                .checked=${this.approvalRequest.noExpenditures}
                @change=${e => this._onFormInput('noExpenditures', e.target.checked)}
                >
              <label for="${page}--noExpenditures">There are no expenses associated with this request</label>
            </div>
            <div>${this.validationHandler.renderErrorMessages('noExpenditures')}</div>
          </div>
        </div>

        <div ?hidden=${this.approvalRequest.noExpenditures}>
          <div class='field-container ${this.validationHandler.errorClass('expenditures')}'>
            <label>Itemized Estimated Expenses</label>
            <div class='expenditures'>
              ${this.expenditureOptions.map(expenditure => renderExpenditureItem.call(this, expenditure))}
            </div>
          </div>
        </div>
      </fieldset>

      <div class='form-buttons alignable-promo__buttons'>
        <button
          type="submit"
          class='btn btn--primary'
          @click=${this._onSubmit}
          ?disabled=${this.userCantSubmit}
          >Review and Submit</button>
        <button
          type="button"
          ?hidden=${!this.canBeSaved}
          ?disabled=${this.userCantSubmit}
          class='btn btn--invert category-brand--secondary'
          @click=${this._onSaveButtonClick}
          >Save</button>
        <button
          type="button"
          ?hidden=${!this.canBeDeleted}
          ?disabled=${this.userCantSubmit}
          class='btn btn--primary category-brand--double-decker'
          @click=${this._onDeleteButtonClick}
          >Delete Draft</button>
      </div>
    </form>
  `;
}

/**
 * @description Render a single expenditure item
 * @param {*} expenditure
 * @returns
 */
function renderExpenditureItem(expenditure){
  return html`
    <div class='expenditure-item'>
      <div class='text'>
        <div class='primary'>${expenditure.label}</div>
        <div class='small'>${unsafeHTML(expenditure.description)}</div>
      </div>
      <div class='amount'></div>
    </div>
  `;
}
