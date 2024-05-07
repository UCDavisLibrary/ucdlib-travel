import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';

import "../../components/ucdlib-employee-search-advanced.js";

export function render() {
return html`
<div class='l-gutter u-space-mb--large'>
  <div class='l-basic--flipped'>
    <div class ='l-content'></div>
    <div class='l-sidebar-second'>
    <div class="panel panel--icon panel--icon-custom panel--icon-secondary">
      <h2 class="panel__title"><span class="panel__custom-icon fa-solid fa-magnifying-glass"></span>Search Library Employees</h2>
      <section>
        <ucdlib-employee-search-advanced
          ${ref(this.employeeSearchRef)}
          .selectButtonText=${'Add to Allocation List'}
          @employee-select=${this._onEmployeeSelect}
          .clearOnSelectConfirmation=${true}>
        </ucdlib-employee-search-advanced>
      </section>
    </div>
    </div>
  </div>
</div>
`;}
