import { html } from 'lit';


export function render() { 
return html`
  
      <div ?hidden=${!this.approvalRequest} class="l-shrink panel">
            <div>     
                  ${this.approvalRequest.approvalStatus ? html`<p class="approvalStatus">${this.approvalRequest.approvalStatus}</p>`: html``}
                  ${this.approvalRequest.reimbursementStatus ? html`<p class="reimbursementStatus">${this.approvalRequest.reimbursementStatus}</p>`: html``}
            </div>

            ${console.log(this.approvalRequest)}
            <div class="teaser">
                  <div class="l-2col l-2col--67-33">
                        <div class="l-first panel">
                                    ${this.approvalRequest ? html`<div class='title'>${this.approvalRequest.label}</div>`:html``}
                                    ${!this.checkKerb(this.approvalRequest.employeeKerberos) ? html`<div class='requestor'>${this.approvalRequest.employee.firstName} ${this.approvalRequest.employee.lastName}</div>`: html``}
                                    <div class="panel panel--icon panel--icon-custom panel--icon-rec-pool">
                                          <p class="panel__title"><span class="panel__custom-icon fa-solid fa-building">
                                                </span>${this.approvalRequest.locationDetails}
                                          </p>
                                          <p class="panel__title"><span class="panel__custom-icon fa-solid fa-calendar">                                              
                                                </span>${this.formatDate(this.approvalRequest.programStartDate)} 
                                                       ${this.approvalRequest.programEndDate ? 
                                                       html`- ${this.formatDate(this.approvalRequest.programEndDate)}`
                                                       :html``}
                                          </p>
                                    </div>
                        </div>
                        <div class="l-second panel">
                              <b>Projected Expenses</b>
                              ${this.approvalRequest.fundingSources && this.approvalRequest.fundingSources.map(dep => html`
                                    ${dep.fundingSourceLabel} - ${this.formatDollar(dep.amount)}<br />
                              `)}
                        </div>
                        
                  </div>
            </div>

                  
                  
      </div>

`;}