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
        ${this.drafts.map(d => html`
          <li><a href='/approval-request/new/${d.approvalRequestId}' class='pointer'><span class="list-title">${d.label ? d.label: html`Unititled Request`}</span></a>
            <br><span class="list-description small">${this._toLocalDateTime(d.submittedAt)}</span>
          </li>
        `)}
      </ul>
    </div>
  </div>

`;}
