import { html } from 'lit';

export function render() {
  return html`
    <div class='component-header'>
      <div class='primary bold'>${this.label}</div>
      <div class='action-buttons'>
        <a
          title='Add funding source'
          ?hidden=${!this.formView || this.reallocateOnly}
          @click=${this._onAddClick}
          class='icon-link quad add-funding-source'>
          <i class="fa-solid fa-circle-plus"></i>
        </a>
        <a
          title='Toggle form view'
          ?hidden=${!this.canToggleView}
          @click=${this._onToggleViewClick}
          class='icon-link'>
          <i class="fa-solid fa-pen"></i>
        </a>
      </div>
    </div>
    ${this.formView ? renderForm.call(this) : renderList.call(this)}
    <div class='total-row'>
      <div>Total</div>
      <div class='total-amount'>$${this.fundingSourceTotal.toFixed(2)}</div>
    </div>
  `;
}

/**
 * @description Render the form view
 */
function renderForm(){
  return html`
    <div class='form-view'>
      <div ?hidden=${!this.hasError} class='flex flex--align-center double-decker u-space-mb'>
        <i class="fa-solid fa-exclamation-circle u-space-mr--small"></i>
        <span>${this.errorMessage}</span>
      </div>
      <div>
        ${this.data.map((fundingSource, index) => html`
          <div class='funding-source'>
            <label>Source</label>
            <div class='inputs'>
              <div>
                <div class='field-container'>
                  <select
                    .value=${fundingSource.fundingSourceId || ''}
                    ?disabled=${this.reallocateOnly}
                    @input=${e => this._onFundingSourceInput(fundingSource, 'fundingSourceId', e.target.value)}
                    >
                    <option value=''>Select a funding source</option>
                    ${this.activeFundingSources.map(source => html`
                      <option
                        value=${source.fundingSourceId}
                        ?selected=${fundingSource.fundingSourceId === source.fundingSourceId}
                        ?disabled=${this.data.some(fs => fs.fundingSourceId === source.fundingSourceId)}
                        >${source.label}</option>
                    `)}
                  </select>
                </div>
              </div>
              <div>
                <div class='amount input--dollar'>
                  <input
                    type='number'
                    class=''
                    .value=${fundingSource.amount}
                    @input=${e => this._onFundingSourceInput(fundingSource, 'amount', e.target.value)}
                  >
                </div>
              </div>
            </div>
            <div class='field-container' ?hidden=${!fundingSource.requireDescription}>
              <label>Description *</label>
              <textarea
                .value=${fundingSource.description}
                rows='4'
                @input=${e => this._onFundingSourceInput(fundingSource, 'description', e.target.value)}
              ></textarea>
            </div>

            <a @click=${() => this._onDeleteClick(index)} class='double-decker small pointer' ?hidden=${this.reallocateOnly}>delete</a>
          </div>
        `)}
      </div>
</div>

  `;
}


/**
 * @description Render the read-only list view
 */
function renderList(){
  return html``;
}
