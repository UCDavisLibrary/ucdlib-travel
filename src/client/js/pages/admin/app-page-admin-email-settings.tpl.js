import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';


export function render() { 
return html`
  Email Settings New

  <app-questions-or-comments page=${this.id} approvalRequestId=1></app-questions-or-comments>
  <email-template></email-template>
`;}