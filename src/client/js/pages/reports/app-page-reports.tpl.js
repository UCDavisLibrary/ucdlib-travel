import { html } from 'lit';

import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js';

export function render() {
return html`
  <ucdlib-pages id='main-pages' selected=${this.page}>
    ${render403.call(this)}
    ${renderReportBuilder.call(this)}
  </ucdlib-pages>
`;}


function render403() {
  return html`
    <div id=${this.getPageId('403')}>
      <div class='message-403'>
        <div class='message-403--icon'>
          <i class='fas fa-exclamation-circle'></i>
        </div>
        <div class='bold'>Not Authorized</div>
        <div class='small grey'>
          <div>You are not authorized to use the report builder tool.</div>
          <div ?hidden=${!this.helpUrl}>
            <div>To request access, please use the following form:</div>
            <div><a href=${this.helpUrl}>${this.helpUrl}</a></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderReportBuilder(){
  return html`
    <div id=${this.getPageId('builder')}>
      <div class='l-gutter u-space-mb--large'>
        <div class='filters panel panel--icon panel--icon-custom'>
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-filter"></span>Filters</h2>
          <div>
            ${this.filterRows.map(row => html`
              <div class="l-4col">
                ${row.map((filter, i) => renderFilter.call(this, filter, i))}
              </div>
              `)}
          </div>
        </div>
      </div>
    </div>
  `
}

function renderFilter(filter, i) {
  const columnClasses = ['l-first', 'l-second', 'l-third', 'l-fourth'];
  const columnClass = columnClasses[i % columnClasses.length];
  const selected = this.selectedFilters[filter.type] || [];
  const options = filter.options || [];
  return html`
    <div class=${columnClass}>
      <div class='field-container'>
        <label>${filter.label}</label>
        <ucd-theme-slim-select @change=${e => this._onFilterChange(e, filter)}>
          <select multiple>
            ${options.map(option => html`
              ${filter.hasOptionGroups ? html`
                <optgroup label=${option.label}>
                  ${option.options.map(opt => html`
                    <option
                      value=${opt.value}
                      ?selected=${selected.includes(opt.value)}
                      >${opt.label}
                    </option>
                  `)}
                </optgroup>
              ` : html`
                <option
                  value=${option.value}
                  ?selected=${selected.includes(option.value)}
                  >${option.label}
                </option>
              `}
            `)}
          </select>
        </ucd-theme-slim-select>
      </div>
    </div>
  `;
}
