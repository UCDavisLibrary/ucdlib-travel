import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ref } from 'lit/directives/ref.js';

import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js';

import reportUtils from '../../../../lib/utils/reports/reportUtils.js';

export function render() {
return html`
  <ucdlib-pages selected=${this.page}>
    ${render403.call(this)}
    ${renderReportBuilder.call(this)}
  </ucdlib-pages>
  ${renderHelpDialog.call(this)}
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
        <div class='l-2col'>
          <div class='l-first container-type--normal'>
            <div class='metrics panel panel--icon panel--icon-custom'>
              <div class='flex flex--space-between flex--align-center'>
                <h2 class="panel__title"><span class="panel__custom-icon fas fa-chart-simple"></span>Metrics</h2>
                <a
                  title='About Metrics'
                  @click=${() => this._onHelpClick('metrics')}
                  class='icon-link u-space-ml--small'>
                  <i class="fa-solid fa-circle-question"></i>
                </a>
              </div>
              <div>
                <ucd-theme-slim-select @change=${e => this.selectedMeasures = Array.isArray(e.detail) ? e.detail.map(option => option.value) : [e.detail.value]}>
                  <select ?multiple=${!(this.selectedAggregatorX && this.selectedAggregatorY)}>
                    ${this.selectedAggregatorX && this.selectedAggregatorY ? html`
                      <option
                        value=''
                        ?selected=${this.selectedMeasures.length === 0}
                        disabled
                        >Select Value
                      </option>
                      ` : html``}
                    ${reportUtils.metrics.map(metric => html`
                      <option
                        value=${metric.value}
                        ?selected=${this.selectedMeasures.includes(metric.value)}
                        >${metric.label}
                      </option>
                      `)}
                  </select>
                </ucd-theme-slim-select>
              </div>
            </div>
          </div>
          <div class='l-second container-type--normal'>
            <div class='aggregators panel panel--icon panel--icon-custom'>
              <div class='flex flex--space-between flex--align-center'>
                <h2 class="panel__title"><span class="panel__custom-icon fas fa-grip"></span>Aggregators</h2>
                <a
                  title='About Aggregators'
                  @click=${() => this._onHelpClick('aggregators')}
                  class='icon-link u-space-ml--small'>
                  <i class="fa-solid fa-circle-question"></i>
                </a>
              </div>
            </div>
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
    <div class='${columnClass} container-type--normal'>
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

/**
 * @description Render help dialog for the page. Content depends on this.helpDialogPage.
 * @returns {TemplateResult}
 */
function renderHelpDialog(){
  return html`
    <dialog ${ref(this.helpDialogRef)}>
      <ucdlib-pages attr-for-selected='dialog-page' selected=${this.helpDialogPage}>
        <div dialog-page='metrics'>
          <div class='u-space-mb'>
            <h4>About Metrics</h4>
            <div>${unsafeHTML(this.SettingsModel.getByKey('metrics_description'))}</div>
          </div>
          <div>
            ${reportUtils.metrics.map(metric => html`
              <div class='u-space-mb--small'>
                <div class='bold primary'>${metric.label}</div>
                <div class='small grey'>${unsafeHTML(this.SettingsModel.getByKey(metric.descriptionSettingKey))}</div>
              </div>
              `)}
          </div>
        </div>
        <div dialog-page='aggregators'>
          <div class='u-space-mb'>
            <h4>About Aggregators</h4>
            <div>${unsafeHTML(this.SettingsModel.getByKey('aggregators_description'))}</div>
          </div>
        </div>
      </ucdlib-pages>
      <div class='alignable-promo__buttons u-space-mt flex flex--wrap'>
        <div class='category-brand--secondary'>
          <button
            class='btn btn--invert'
            type='button'
            @click=${() => this.helpDialogRef.value.close()} >
            Close
          </button>
        </div>
      </div>
    </dialog>
  `;
}
