import { html } from 'lit';
import '../../components/approval-request-header.js';

export function render() {
return html`
  <approval-request-header .approvalRequest=${this.approvalRequest}></approval-request-header>


`;}
