import { html } from 'lit';

export function render() { 
return html`
<div class='l-gutter u-space-mb--large'>
  <div class='l-basic--flipped'>
    <div class ='l-content'></div>
    <div class='l-sidebar-second'>
      <a href=${this.AppStateModel.store.breadcrumbs['admin-allocations-new'].link} class="focal-link u-space-mb category-brand--quad">
        <div class="focal-link__figure focal-link__icon">
          <i class="fas fa-plus fa-2x"></i>
        </div>
        <div class="focal-link__body">
          <strong>Add Allocations</strong>
        </div>
      </a>
    </div>
  </div>
</div>
`;}