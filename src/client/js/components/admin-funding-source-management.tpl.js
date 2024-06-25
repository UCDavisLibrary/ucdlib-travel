import { html } from 'lit';


export function render() {
return html`
  <div>
    <h2 class='heading--underline'>Funding Sources</h2>
    <div>
      ${this.fundingSources.map(fundingSource => {
        if ( fundingSource.editing ) return renderFundingSourceForm.call(this, fundingSource);
        return renderFundingSource.call(this, fundingSource);})
      }
    </div>
  </div>
`;}

function renderFundingSource(fundingSource){
  const capAmount = Number(fundingSource.capDefault)?.toFixed(2);
  return html`
    <div class='funding-source'>
      <div class='funding-source__header'>
        <h3>${fundingSource.label}</h3>
        <a
          title='Edit funding source'
          @click=${e => this._onEditClick(fundingSource)}
          class='icon-link'><i class="wonder-blue fa-solid fa-pen-to-square"></i></a>
        <a
          title='Delete funding source'
          @click=${e => this._onDeleteClick(fundingSource)}
          class='icon-link double-decker'>
          <i class="fa-solid fa-trash-can"></i></a>
      </div>
      <div ?hidden=${!fundingSource.description}>${fundingSource.description}</div>
      <div>
        <div ?hidden=${!fundingSource.hasCap}>
          <span class='bold'>Allocation Cap:</span> <span>$${capAmount}</span>
        </div>
        <div>
          <span class='bold'>Additional Info Required:</span> <span>${fundingSource.requireDescription ? 'Yes' : 'No'}</span>
        </div>
      </div>
      <div class='u-space-mt'>
        <h5>Approval Chain</h5>
        <div class='flex flex--align-center'>
        ${fundingSource.approverTypes.map((approverType, i) => html`
          <div>${approverType.label}</div>
          <div class='u-space-mx--small primary smaller' ?hidden=${i === fundingSource.approverTypes.length - 1}>
            <i class='fa-solid fa-circle-chevron-right'></i>
          </div>
        `)}
        </div>
      </div>

    </div>

  `;
}

function renderFundingSourceForm(fundingSource){
  if ( !fundingSource ) return html``;
  const id = fundingSource.fundingSourceId || 'new';
  const inputIdLabel = `funding-source-label-${id}`;
  const inputIdDescription = `funding-source-description-${id}`;
  const inputIdHasCap = `funding-source-has-cap-${id}`;
  const inputIdCapDefault = `funding-source-cap-default-${id}`;
  const inputIdRequireDescription = `funding-source-require-description-${id}`;

  return html`
    <form funding-source-id=${fundingSource.fundingSourceId} @submit=${this._onSubmit} class='funding-source-form'>
      ${id === 'new' ? html`<h3>Create New Funding Source</h3>` : html`<h3>Edit Funding Source</h3>`}

      <div class='field-container ${fundingSource.validationHandler.errorClass('label')}'>
        <label for=${inputIdLabel}>Label <abbr title="Required">*</abbr></label>
        <input id=${inputIdLabel} type='text' value=${fundingSource.label || ''} @input=${e => this._onFormInput('label', e.target.value, fundingSource)}>
        ${fundingSource.validationHandler.renderErrorMessages('label')}
      </div>

      <div class='field-container ${fundingSource.validationHandler.errorClass('description')}'>
        <label for=${inputIdDescription}>Description</label>
        <textarea
          id=${inputIdDescription}
          .value=${fundingSource.description || ''}
          rows='4'
          @input=${e => this._onFormInput('description', e.target.value, fundingSource)}></textarea>
        ${fundingSource.validationHandler.renderErrorMessages('description')}
      </div>

      <div class='field-container'>
        <div class='checkbox'>
          <input
            id=${inputIdHasCap}
            type='checkbox'
            .checked=${fundingSource.hasCap}
            @change=${() => this._onFormInput('hasCap', !fundingSource.hasCap, fundingSource)}>
          <label for=${inputIdHasCap}>Has Allocation Cap</label>
        </div>
      </div>

      <div ?hidden=${!fundingSource.hasCap} class='field-container ${fundingSource.validationHandler.errorClass('capDefault')}'>
        <label for=${inputIdCapDefault}>Allocation Cap</label>

        <div class='input--dollar'>
          <input
            type='number'
            class=''
            .value=${fundingSource.capDefault || ''}
            @input=${e => this._onFormInput('capDefault', e.target.value, fundingSource)}
          >
        </div>
        ${fundingSource.validationHandler.renderErrorMessages('capDefault')}
      </div>

      <div class='field-container'>
        <div class='checkbox'>
          <div>
            <input
              id=${inputIdRequireDescription}
              type='checkbox'
              .checked=${fundingSource.requireDescription}
              @change=${() => this._onFormInput('requireDescription', !fundingSource.requireDescription, fundingSource)}>
            <label for=${inputIdRequireDescription}>Additional Info Required</label>
          </div>
          <div class='option-description'>Require requester to submit additional information/description about funding source</div>
        </div>
      </div>

      <div class='field-container ${fundingSource.validationHandler.errorClass('approverTypes')}'>
        <div class='flex flex--space-between flex--align-center'>
          <label>Approval Chain</label>
          <a
            title='Add New Approver Type'
            @click=${e => this._onAddApproverTypeClick(fundingSource)}
            class='icon-link quad'>
            <i class="fa-solid fa-circle-plus"></i>
          </a>
        </div>
        <div>
          ${fundingSource.approverTypes.map((approverType, i) => html`
            <div class='flex flex--align-center u-space-mb--small'>
              <select
                class='flex-grow u-space-mr--small'
                @change=${e => this._onApproverTypeSelect(fundingSource, i, e.target.value)}
                .value=${approverType.approverTypeId}
                >
                <option value='0' ?selected=${approverType.approverTypeId == 0}>Select Approver Type</option>
                ${this.approverTypes.map(at => html`
                  <option
                    value=${at.approverTypeId}
                    ?disabled=${fundingSource.approverTypes.some(at2 => at2.approverTypeId == at.approverTypeId)}
                    ?selected=${approverType.approverTypeId == at.approverTypeId}>
                    ${at.label}
                  </option>
                `)}
              </select>
              <a
                title='Remove Approver Type'
                @click=${e => this._onRemoveApproverTypeClick(fundingSource, i)}
                class='icon-link double-decker u-space-mr--small'>
                <i class="fa-solid fa-circle-minus"></i>
              </a>
              <a
                title='Move Up'
                @click=${e => this._onMoveApproverTypeClick(fundingSource, i, 'up')}
                class='icon-link u-space-mr--small'>
                <i class="fa-solid fa-circle-arrow-up"></i>
              </a>
              <a
                title='Move Down'
                @click=${e => this._onMoveApproverTypeClick(fundingSource, i, 'down')}
                class='icon-link'>
                <i class="fa-solid fa-circle-arrow-down"></i>
            </div>
          `)}
        </div>

      </div>


      <div class='buttons'>
        <button type='submit' class='btn btn--alt3'>Save</button>
        <button @click=${e => this._onEditCancelClick(fundingSource)} type='button' class='btn btn--alt3'>Cancel</button>
      </div>
    </form>
  `;
}
