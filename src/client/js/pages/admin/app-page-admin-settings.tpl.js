import { html } from 'lit';

export function render() {
return html`
  <div class='l-gutter l-container--narrow'>
    <div>
      ${this.settings.map(setting => renderSetting.call(this, setting))}
    </div>
  </div>
`;}

function renderSetting(setting){
  if ( !setting || !setting.settingsId ) return html``;
  const inputId = `setting-${setting.settingsId}`;
  const defaultValueId = `${inputId}-default-value`;
  const value = setting.useDefaultValue ? setting.defaultValue : setting.value;

  let input = html`
    <input
      id="${inputId}"
      type=${setting.inputType}
      .value=${value}
      ?disabled=${setting.useDefaultValue}
      @input=${(e) => this._onSettingValueChange(setting.settingsId, e.target.value)}
       />
  `;
  if ( setting.inputType == 'textarea' ) {
    input = html`
      <textarea
        id="${inputId}"
        .value=${value}
        ?disabled=${setting.useDefaultValue}
        @input=${(e) => this._onSettingValueChange(setting.settingsId, e.target.value)}
        ?hidden=${setting.useDefaultValue}></textarea>
    `;
  }

  return html`
    <div class="field-container" ?hidden=${setting.hidden}>
      <div class="setting-header">
        <label for="${inputId}">${setting.label}</label>
        <div class="checkbox" ?hidden=${!setting.defaultValue}>
          <input type="checkbox"
            id="${defaultValueId}"
            @input=${() => this._onSettingDefaultToggle(setting.settingsId)}
            .checked=${setting.useDefaultValue} />
          <label for="${defaultValueId}">Use default value</label>
        </div>
      </div>
      ${input}
      <div class='setting-description'>${setting.description}</div>
    </div>
  `;
}
