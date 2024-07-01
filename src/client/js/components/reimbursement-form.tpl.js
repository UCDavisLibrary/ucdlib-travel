import { html } from 'lit';

export function render() {
  const idPrefix = `reimbursement-form--${this.reimbursementRequest.approval_request_revision_id || 'new'}`;
  return html`
    <form @submit=${this._onSubmit}>
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

      <div class='form-buttons alignable-promo__buttons'>
        <button
          type="submit"
          class='btn btn--primary'
          >Submit</button>

      </div>
    </form>


  `;}
