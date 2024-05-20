import { html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-brand-textbox/ucd-theme-brand-textbox.js'


export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
  `;

  return [elementStyles];
}

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

      ${renderApproverForm.call(this, this.newApproverType)}
          
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
          <div id=${itemIdDescription} >${ap.description}</div>

          ${ap.systemGenerated || ap.employees[0] != null ? html`
            <div id=${itemIdEmployees}>
              ${ap.employees.map((employee) => html`
                <span>
                  <b style="color:#022851"><i class="fa-solid fa-user" style="color:#13639E;width:15px;height:15px;"></i>&nbsp;${!ap.systemGenerated ? html`${employee.firstName} ${employee.lastName}`:html`System Generated`}</b><br />
                </span>  
              `)}
            </div>
          `:html``}   
      </div>
  `
}

function renderApproverForm(approver) {
  if ( !approver || Object.keys(approver).length === 0 ) return html``;
  const approverId = approver.approverTypeId || 'new';

  const inputIdLabel = `approver-label-${approverId}`;
  const inputIdDescription = `approver-description-${approverId}`;

  return html`
  <form approver-type-id=${approver.approverTypeId} @submit=${this._onNewSubmit}>
    <section class="approvertype-form">
      <div class="l-2col layout-columns">
        <h3 class="section-header"><em>Edit Approver</em>
          <div class="field-container">
              <label class="textLabel" for=${inputIdLabel}>Label <abbr title="Required">*</abbr></label>
              <input class="inputLabel" .value=${approver.label} id=${inputIdLabel} @input=${(e) => this._setLabel(e.target.value, approver)} type="text" placeholder="Position Title">
          </div>
          <div class="field-container">
            <label for=${inputIdDescription} class="textDescriptionLabel">Description</label>
            <textarea id=${inputIdDescription} .value=${approver.description} class="textDescription" @input=${(e) => this._setDescription(e.target.value, approver)} rows="8" cols="48" placeholder="Approver Type Description"></textarea>
        </div>

        <ucdlib-employee-search-basic></ucdlib-employee-search-basic>
      </div>

      ${approver.editing ? html`
        <span>
          <p>
            <button type='submit' class="btn btn--alt3">Save Button</button>
            <button @click=${e => this._onEditCancel(e,approver)} class="btn btn--alt3">Cancel Button</button>
          </p>
        </span> 
      `:html``}

      ${approverId == 'new' ? 
        html`<p><button type='submit' class="btn btn--primary" style="margin:20px 0px 0px 0px">Add New Approver</button></p> `
        :html``
      }
      
    </section>
  </form>

    `
}