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
    <form class='skinny-form'>
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
          @input=${e => this._onFormInput('businessPurpose', e.target.value)}
          >${this.approvalRequest.businessPurpose || ''}</textarea>
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
    </form>
  `;
}
