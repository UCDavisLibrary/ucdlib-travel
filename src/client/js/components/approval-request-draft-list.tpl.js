import { html } from 'lit';

export function render() { 
return html`
  <div ?hidden=${!this.drafts.length} class='panel panel--icon panel--icon-custom panel--icon-secondary'>
    <div>
      <div>
        <h4 class="panel__title"><span class="panel__custom-icon fa-solid fa-file-import"></span>Your Drafts</h4>
      </div>
      <p>You have unsubmitted drafts. Click one to resume where you left off:</p>
      <ul class="list--bordered">
        ${draftList.call(this, this.drafts)}
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