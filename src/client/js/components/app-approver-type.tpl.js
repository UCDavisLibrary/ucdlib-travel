import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-brand-textbox/ucd-theme-brand-textbox.js'

export function render() {
return html`
    <div class="l-container">
      <h2 class='heading--underline'>Approvers</h2>
      <div class="approvertype_description">
      <p>${unsafeHTML(this.SettingsModel.getByKey('approver_type_description'))}</p>
    </div>
      <section class="approvertype-info">
      ${this.existingApprovers.map((approver) => {
        if(approver.editing) return renderApproverForm.call(this, approver);
        return renderApproverItem.call(this, approver);
      })}
      </section>

      ${this.new ? renderApproverForm.call(this, this.newApproverType) : html`
        <p><button @click=${e => this.new = true} class="btn btn--primary" style="margin:20px 0px 0px 0px" >Add New Approver</button></p>
      `}
    </div>

`;}


function renderApproverItem(ap) {
  const approverId = ap.approverTypeId;
  const itemIdLabel = `approver-type-label-${approverId}`;
  const itemIdDescription = `approver-type-description-${approverId}`;
  const itemIdEmployees = `approver-type-employee-${approverId}`;

  return html`
      <div class="approvertype-block">
          <span>
            <h3 style="display:inline;" id=${itemIdLabel} class="section-header"><em>${ap.label}</em></h3>
              <a @click=${e => this._onEdit(e, ap)} class='icon-link admin-blue'>
                      <i class="fa-solid fa-pen-to-square"></i>
              </a>

              ${!ap.systemGenerated ? html`
                <a @click=${e => this._onDelete(ap)} class='icon-link double-decker'>
                        <i class="fa-solid fa-trash"></i>
                </a>
              `:html``}
          </span>
          <div id=${itemIdDescription}>${ap.description}</div>

            ${!ap.systemGenerated ? html`
              <div ?hidden=${!ap.employees} id=${itemIdEmployees}>
                ${ap.employees && ap.employees.map((employee) => html`
                  <div >
                    <b class="approverList"><i class="fa-solid fa-user"></i>&nbsp;${employee ? html`${employee.firstName} ${employee.lastName}`:html``}</b><br />
                  </div>
                `)}
              </div>
            `:html`<b class="approverList"><i class="fa-solid fa-user"></i>&nbsp;System Generated</b><br />`}
      </div>
  `
}

function renderApproverForm(approver) {
  if ( !approver || Object.keys(approver).length === 0 ) return html``;
  const approverId = approver.approverTypeId || 'new';

  const inputIdLabel = `approver-label-${approverId}`;
  const inputIdDescription = `approver-description-${approverId}`;

  return html`
  <form approver-type-id=${approver.approverTypeId || 0 } @submit=${this._onFormSubmit}>
    <section class="approvertype-form">
      <h3 class="section-header"><em>${approver.editing ? html`Edit Approver`:html`Add Approver`}</em></h3>
      <div class="field-container ${approver.validationHandler.errorClass('label')}">
        <label class="textLabel" for=${inputIdLabel}>Label <abbr title="Required">*</abbr></label>
        <input class="inputLabel" .value=${approver.label || ''} id=${inputIdLabel} @input=${(e) => this._setLabel(e.target.value, approver)} type="text" placeholder="Approver Type Title">
        <div>${approver.validationHandler.renderErrorMessages('label')}</div>
      </div>
      <div class="field-container">
        <label for=${inputIdDescription} class="textDescriptionLabel">Description</label>
        <textarea id=${inputIdDescription} .value=${approver.description || ''} class="textDescription" @input=${(e) => this._setDescription(e.target.value, approver)} rows="8" cols="48" placeholder="Approver Type Description"></textarea>
      </div>

      <div class="field-container ${approver.validationHandler.errorClass('employees')}" ?hidden=${approver.systemGenerated}>
        <label class="employeeLabel">Employee(s)*</label>
        <a @click=${() => this._onAddBar(approver)} class='icon-link quad'>
            <i class="fa-solid fa-circle-plus"></i>
        </a>
        <div>${approver.validationHandler.renderErrorMessages('employees')}</div>
      </div>
      <div ?hidden=${approver.systemGenerated}>
        ${approver.employees && approver.employees.map((emp, index) => html`
          <div class="field-container">
            <div class="employee-search-bar">
              ${emp ? html`
                <ucdlib-employee-search-basic
                  class="employee-search"
                  selected-value=${emp.kerberos ?? ''}
                  @status-change=${e => this._onEmployeeSelect(e,approver,index)}
                  hide-label>
                </ucdlib-employee-search-basic>
              `:html``}
            </div>
            <a  @click=${() => this._onDeleteBar(index, approver)} class='icon-link double-decker'>
                <i class="fa-solid fa-circle-minus"></i>
            </a>
          </div>
        `)}
      </div>

      <span class="field-container">
          <p>
            <button type='submit' class="btn btn--alt3">Save</button>
            <button @click=${() => this._onEditCancel(approver)} class="btn btn--alt3">Cancel</button>
          </p>
      </span>

    </section>
  </form>

    `
}
