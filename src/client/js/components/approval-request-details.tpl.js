import { html } from 'lit';

/**
 * @description Main render function for this component
 * @returns {TemplateResult}
 */
export function render() {
  return html`
    ${renderField('Title', this.approvalRequest.label)}
    ${renderField('Employee', this.getEmployeeName())}
    ${renderField('Name of Sponsoring Organization', this.approvalRequest.organization)}
    ${renderField('Business Purpose', this.approvalRequest.businessPurpose)}
    ${renderField('Location', this.getLocation())}
    ${renderField('Program Dates', this.getProgramDates())}
    ${renderField('Travel Dates', this.getTravelDates(), 'Not Applicable')}
    ${renderField('Comments', this.approvalRequest.comments, 'None')}
  `;}

function renderField(label, value, defaultValue='') {
  return html`
    <div class='u-space-mb--small'>
      <div class='primary bold'>${label}</div>
      <div>${value || defaultValue}</div>
    </div>
  `;
}
