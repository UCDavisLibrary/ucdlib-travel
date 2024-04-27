import { html } from 'lit';

export function render() { 
return html`

${!this.nopopup ? html`
  <div ?hidden=${this.hidden} class="toast" >
    <p>${this.text}</p>
  </div>
`:html``}


`;}