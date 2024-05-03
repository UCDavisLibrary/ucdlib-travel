import { html, css } from 'lit';

export function render() { 
  if ( this._initialized == 'error' ) {
    return html`
    <div class="alert alert--error">
      An error occurred while loading the employee search form. Please try again later.
    </div>
    `;
  } else if ( this._initialized == 'loading' ) {
    return html`
      <p>Loading...</p>
    `;
  } else if ( this._initialized ) {
    return html`
      <p>lets do some searching</p>
    `;
  }
}