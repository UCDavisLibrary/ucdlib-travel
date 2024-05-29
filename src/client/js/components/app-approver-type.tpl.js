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
      <p>${unsafeHTML(this.description)}</p>
      </div>

      <section class="approvertype-info">
      ${this.existingApprovers.map((approver) => {
        if(approver.editing) return renderApproverForm.call(this, approver);
        return renderApproverItem.call(this, approver);
      })}
      </section> 

      ${this.new ? html`${renderApproverForm.call(this, this.newApproverType)}`:html`
        <p><button @click=${e => this._newForm(e)} class="btn btn--primary" style="margin:20px 0px 0px 0px" >Add New Approver</button></p>
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
            <div ?hidden=${!ap.systemGenerated && ap.employees[0] == null} id=${itemIdEmployees}>
              ${ap.employees.map((employee) => html`
                <div>
                  <b class="approverList"><i class="fa-solid fa-user"></i>&nbsp;${!ap.systemGenerated && ap.employees[0] ? html`${employee.firstName} ${employee.lastName}`:html`System Generated`}</b><br />
                </div>  
              `)}
            </div>
      </div>
  `
}

function renderApproverForm(approver) {
  if ( !approver || Object.keys(approver).length === 0 ) return html``;
  const title = "Edit Approver" 
  const approverId = approver.approverTypeId || 'new';

  const inputIdLabel = `approver-label-${approverId}`;
  const inputIdDescription = `approver-description-${approverId}`;
  this.approver = approver;

  return html`
  <form approver-type-id=${approver.approverTypeId || 0 } @submit=${this._onFormSubmit}>
    <section class="approvertype-form">
      <div class="l-2col layout-columns">
        <h3 class="section-header"><em>${this.approver.editing ? html`Edit Approver`:html`Add Approver`}</em>
          <div class="field-container">
              <label class="textLabel" for=${inputIdLabel}>Label <abbr title="Required">*</abbr></label>
              <input class="inputLabel" .value=${this.approver.label || ''} id=${inputIdLabel} @input=${(e) => this._setLabel(e.target.value, this.approver)} type="text" placeholder="Position Title">
          </div>
          <div class="field-container">
            <label for=${inputIdDescription} class="textDescriptionLabel">Description</label>
            <textarea id=${inputIdDescription} .value=${this.approver.description || ''} class="textDescription" @input=${(e) => this._setDescription(e.target.value, this.approver)} rows="8" cols="48" placeholder="Approver Type Description"></textarea>
          </div>

          <div class="field-container">
            <label class="employeeLabel">Employee(s)*</label>
            <a @click=${e => this._onAddBar(e, this.approver)} class='icon-link quad'>
                <i class="fa-solid fa-circle-plus"></i>
            </a> 
          </div>

          ${this.approver.editing ? html`
            ${this.approver.employees.map((emp, index) => html`
                <div ?hidden=${this.approver.systemGenerated} id="employee-edit-bar-${index}" class="field-container">
                  <div class="employee-search-bar">
                    <ucdlib-employee-search-basic
                      class="employee-search"
                      selectedValue=${emp.kerberos}
                      @status-change=${e => this._onEmployeeSelect(e, index)} 
                      hide-label>
                    </ucdlib-employee-search-basic> 
                  </div>
                  <a id="employee-link-${index}" @click=${e => this._onDeleteBar(e, index)} class='icon-link double-decker'>
                      <i class="fa-solid fa-circle-minus"></i>
                  </a> 
                </div>    
            `)}
          `:html`
            ${this.approver.employees.map((emp, index) => html`
                <div id="employee-new-bar-${index}" class="field-container">
                  <div class="employee-search-bar">
                    <ucdlib-employee-search-basic
                      class="employee-search"
                      @status-change=${e => this._onEmployeeSelect(e, index)} 
                      hide-label>
                    </ucdlib-employee-search-basic> 
                  </div>
                  <a id="employee-link-${index}" @click=${e => this._onDeleteBar(e, index)} class='icon-link double-decker'>
                      <i class="fa-solid fa-circle-minus"></i>
                  </a> 
                </div>    
            `)}
          `}


          <span class="field-container">
              <p>
                <button type='submit' class="btn btn--alt3">Save Button</button>
                <button @click=${e => this._onEditCancel(e,this.approver)} class="btn btn--alt3">Cancel Button</button>
              </p>
            </span> 


            
      </div>


      <!-- ${approverId == 'new' ? 
        html`<p><button type='submit' class="btn btn--primary" style="margin:20px 0px 0px 0px" >Add New Approver</button></p> `
        :html``
      } -->
      
    </section>
  </form>

    `
}