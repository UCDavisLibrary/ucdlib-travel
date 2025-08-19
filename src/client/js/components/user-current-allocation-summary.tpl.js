import { html } from 'lit';
import typeTransform from '../../../lib/utils/typeTransform.js';
import featureFlags from '../utils/featureFlags.js';

/**
 * @description main render function for the component
 * @returns {TemplateResult}
 */
export function render() {
return html`
  <div class="panel panel--icon panel--icon-custom panel--icon-tahoe">
    <h2 class="panel__title">
      <i class="panel__custom-icon fas fa-money-bill-wave tahoe"></i>
      <span ?hidden=${this.forAnother}>Your Allocations</span>
      <span ?hidden=${!this.forAnother}>Employee Allocations</span>
    </h2>
    <div class='u-space-mb'>${this.introText}</div>
    <div>
      <ul class='tabs tabs--secondary'>
        ${this.fiscalYears.map(fy => html`
          <li>
            <a
              @click=${() => this.selectedFiscalYear = fy.startYear}
              class='pointer tabs__item ${fy.startYear == this.selectedFiscalYear ? 'tabs__item--active' : ''}'>FY ${fy.labelShort}</a>
          </li>
          `)}
      </ul>
      <div>
        ${this.funds.map(fund => html`
          <div class='u-space-mb'>
            <div class='primary bold u-space-mb--small'>${fund.label}</div>
            <div>
              <div class='flex flex--space-between flex--align-center small'>
                <div>Allocated</div>
                <div class='monospace-number'>+ ${typeTransform.toDollarString(fund.employeeAllocation, true)}</div>
              </div>
              <div class='flex flex--space-between flex--align-center small' ?hidden=${featureFlags.reimbursementDisabled}>
                <div>Reimbursed</div>
                <div class='monospace-number'>- ${typeTransform.toDollarString(fund.employeeReimbursed, true)}</div>
              </div>
              <div class='flex flex--space-between flex--align-center small' ?hidden=${!fund.approvalRequestTotal}>
                <div>This Request</div>
                <div class='monospace-number'>- ${typeTransform.toDollarString(fund.approvalRequestTotal, true)}</div>
              </div>
              <div class='flex flex--space-between flex--align-center small'>
                <div>${featureFlags.reimbursementDisabled ? 'Other Requests' : 'Projected'}</div>
                <div class='monospace-number'>- ${typeTransform.toDollarString(fund.employeeProjected, true)}</div>
              </div>
              <div class='flex flex--space-between flex--align-center small bold'>
                <div>Remaining</div>
                <div class='monospace-number ${fund.employeeRemainingIsNegative ? 'double-decker' : 'quad'}'>${fund.employeeRemainingIsNegative ? '-' : '+'} ${typeTransform.toDollarString(fund.employeeRemainingAbs, true)}</div>
              </div>
            </div>
          </div>
          `)}
      </div>
      <div ?hidden=${this.funds.length}>There are currently no allocations for this fiscal year</div>
    </div>
  </div>

`;}
