import { html } from 'lit';

export function render() {
return html`
  <div class='l-gutter u-space-py--large'>
    <div>
      <h1>${this.approvalRequest.label || ''}</h1>
      <div class='bold primary'>
        <div>${this.approvalRequest.organization || ''}</div>
        <div>${this.getProgramDates()}</div>
      </div>
    </div>
  </div>

`;}
