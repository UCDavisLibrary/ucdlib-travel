import { html } from 'lit';

export function render() { 
return html`
  <div ?hidden=${this.drafts === []} class='component'>
    <div class='inner-component'>
      <div class='componentHeader'>
        <span class="icon"> <i class='fa-solid fa-file-import'></i></span>
        <span class="draftHeading">Your Drafts</span>
      </div>
      <p>You have unsubmitted drafts. Click one to resume where you left off:</p>
      <ul class="list--bordered">
      ${this.existingDrafts && this.existingDrafts.length !=0 ?
        draftList.call(this, this.existingDrafts):
        draftList.call(this, this.drafts)   
      }

      </ul>
    </div>
  </div>

`;}

function draftList(draftsList) {
  return html`        
    ${draftsList && draftsList.map(d => html`
      <li><a href='/approval-request/new/${d.approvalRequestId}'><span class="listTitle">${d.label ? d.label: html`Unititled Request`}</span></a>
        <br><span class="listDescription">${new Date(d.submittedAt)}</span>
      </li>
    `)}
  `}