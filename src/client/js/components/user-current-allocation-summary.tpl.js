import { html } from 'lit';
import typeTransform from '../../../lib/utils/typeTransform.js';

export function render() {
return html`
  <div class="panel panel--icon panel--icon-custom panel--icon-tahoe">
    <h2 class="panel__title"><i class="panel__custom-icon fas fa-money-bill-wave tahoe"></i>Your Allocations</h2>
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
                <div class='monospace-number'>$${typeTransform.toDollarString(fund.employeeAllocation)}</div>
              </div>
              <div class='flex flex--space-between flex--align-center small'>
                <div>Spent/Requested</div>
                <div class='monospace-number'>$${typeTransform.toDollarString(fund.employeeProjected + fund.employeeReimbursed)}</div>
              </div>
              <div class='flex flex--space-between flex--align-center small'>
                <div>Remaining</div>
                <div class='monospace-number'>$${typeTransform.toDollarString(fund.employeeAllocation - (fund.employeeProjected + fund.employeeReimbursed))}</div>
              </div>

            </div>
          </div>
          `)}
      </div>
      <div ?hidden=${this.funds.length}>There are currently no allocations for this fiscal year</div>
    </div>
  </div>

`;}
