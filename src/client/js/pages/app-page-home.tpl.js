import { html } from 'lit';

export function render() {
return html`
  <div class='l-container'>
    <div class='l-basic--flipped'>
      <div class="l-content">
        <p>Home Page</p>


      <!-- Delete this Button function it is for testing only and
           cooresponding click function (this._makeToastActive) -->
        <button
        id="toastButton"
        @click=${this._makeToastActive}
        type='button'
        class="btn btn--alt btn--block u-space-mt border-box">Test Toast
      </button>
      <travel-toast></travel-toast>

      </div>
    </div>
  </div>

`;}
