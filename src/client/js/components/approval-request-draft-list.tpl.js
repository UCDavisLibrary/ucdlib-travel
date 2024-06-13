import { html } from 'lit';

export function render() { 
return html`
  <div ?hidden=${!this.drafts.initial.length} class='component'>
    <div>
      <div class='component-header'>
        <span class="icon"> <i class='fa-solid fa-file-import'></i></span>
        <span class="draft-heading">Your Drafts</span>
      </div>
      <p>You have unsubmitted drafts. Click one to resume where you left off:</p>
      <ul class="list--bordered">
      ${this.drafts.edit && this.drafts.edit.length !=0 ?
        draftList.call(this, this.drafts.edit):
        draftList.call(this, this.drafts.initial)   
      }
      </ul>
    </div>
  </div>

`;}

function draftList(draftsList) {
  return html`        
    ${draftsList && draftsList.map(d => html`
      <li><a href='/approval-request/new/${d.approvalRequestId}'><span class="list-title">${d.label ? d.label: html`Unititled Request`}</span></a>
        <br><span class="list-description">${new Date(d.submittedAt)}</span>
      </li>
    `)}
  `}