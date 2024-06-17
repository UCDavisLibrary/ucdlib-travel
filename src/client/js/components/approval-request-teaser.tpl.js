import { html } from 'lit';


export function render() { 
return html`
  
      <div ?hidden=${!this.approvalRequest} class="l-shrink panel">
            <div>     
                  <p ?hidden=${!this.approvalRequest.approvalStatus} class="approvalStatus">${this.ToUpperCase(this.approvalRequest.approvalStatus)}</p>
                  <p ?hidden=${!this.approvalRequest.reimbursementStatus} class="reimbursementStatus">${this.ToUpperCase(this.approvalRequest.reimbursementStatus)}</p>
            </div>

            <div class="teaser">
                  <div class="l-2col l-2col--67-33">
                        <div class="l-first panel">
                                    <div ?hidden=${!this.approvalRequest.label} class='title'>${this.approvalRequest.label}</div>
                                    <div ?hidden=${!this.approvalRequest.employeeKerberos} class='requestor'>
                                          ${!this.checkKerb(this.approvalRequest.employeeKerberos) ? 
                                                html`${this.approvalRequest.employee.firstName} ${this.approvalRequest.employee.lastName}</div>`
                                                :html``}
                                    </div>
                                    <div class="panel panel--icon panel--icon-custom panel--icon-rec-pool">
                                          <p ?hidden=${!this.approvalRequest.locationDetails} class="panel__title"><span class="panel__custom-icon fa-solid fa-building"></span>
                                                ${this.approvalRequest.locationDetails}
                                          </p>


                                          <p ?hidden=${!this.approvalRequest.programStartDate} class="panel__title"><span class="panel__custom-icon fa-solid fa-calendar"></span>
                                                ${this.formatDate(this.approvalRequest.programStartDate)}
                                                ${this.approvalRequest.programEndDate ? 
                                                      html`- ${this.formatDate(this.approvalRequest.programEndDate)}`
                                                      :html``}
                                          </p>
                                    </div>
                        </div>
                        <div ?hidden=${!this.approvalRequest.fundingSources} class="l-second panel">
                              <div>
                                    <b>Projected Expenses</b>

                                    ${this.approvalRequest.fundingSources.map(dep => html`
                                          ${dep.fundingSourceLabel} - ${this.formatDollar(dep.amount)}<br />
                                    `)}
                              </div>
                        </div>
                        
                  </div>
            </div>

                  
                  
      </div>

`;}