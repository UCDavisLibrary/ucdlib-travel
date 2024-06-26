import { html } from 'lit';
import applicationOptions from '../../../lib/utils/applicationOptions.js';


export function render() { 
return html`
<div ?hidden=${!this.approvalRequest}>
  <div> 
    ${this.approvalStatus ? 
        html`<p ?hidden=${!this.approvalRequest.approvalStatus} class="approval-status">${this.approvalStatus}</p>
        `:html`<p ?hidden=${!this.approvalRequest.approvalStatus} class="approval-status">${this.ToUpperCase(this.approvalRequest.approvalStatus)}</p>`
    }

    <p ?hidden=${!this.approvalRequest.reimbursementStatus} class="reimbursement-status">${this.applicationOptions(this.approvalRequest.reimbursementStatus)}</p>
  </div>

  <div class="teaser">
    <div class="teaser-info">
      <a href="/approval-request/new/${this.approvalRequest.approvalRequestId}">
        <div ?hidden=${!this.approvalRequest.label} class='title'>
          ${this.approvalRequest.label}
        </div>
      </a>
      <div ?hidden=${!this.approvalRequest.employeeKerberos} class='requestor'>
          ${!this.checkKerb(this.approvalRequest.employeeKerberos) ? 
              html`${this.approvalRequest.employee.firstName} ${this.approvalRequest.employee.lastName}`
              :html``
          }
      </div>
      <div  ?hidden=${!this.approvalRequest.locationDetails} class="list-content">
        <span class="icon-image">
          <i class="fa-solid fa-building"></i>
        </span>
        <p ?hidden=${!this.approvalRequest.locationDetails} class="icon-text">${this.approvalRequest.locationDetails}</p>
      </div>
      <br />
      <div ?hidden=${!this.approvalRequest.programStartDate}  class="list-content">
        <span class="icon-image"><i class="fa-solid fa-calendar"></i></span>
          <p class="icon-text">
            ${this.formatDate(this.approvalRequest.programStartDate)}
            ${this.approvalRequest.programEndDate ? 
              html`- ${this.formatDate(this.approvalRequest.programEndDate)}`
              :html``
            }
          </p>
      </div>
       
    </div>
    <div ?hidden=${!this.approvalRequest.fundingSources} class="teaser-expenses">
      <div>
        <b>Projected Expenses</b>
        <br />                                    
        ${this.approvalRequest.fundingSources.map(dep => html`
          ${dep.fundingSourceLabel} - ${this.formatDollar(dep.amount)}<br />
        `)}
      </div>
    </div>
                        
  </div>          
</div>

`;}