import { html } from 'lit';
import '@ucd-lib/theme-elements/brand/ucd-theme-search-form/ucd-theme-search-form.js'


export function render() { 
  const group = this.sortSettings()
return html`
  <div class='l-gutter l-container--narrow u-space-mb--large'>
    <form @submit=${this._onFormSubmit}>
      <ucd-theme-search-form
        placeholder='Search settings'
        class='u-space-mb'
        .value=${this.searchString}
        @search=${this._onSearch}>
      </ucd-theme-search-form>
      <div>
        ${group.map((setting) => renderEmailSetting.call(this, setting))}
      </div>
      <div ?hidden=${!this.noSettings} class='u-space-mt--large'>
        <p>No settings match your search. <a class='pointer' @click=${this.clearAndFocusSearch}>Try another search term.</a></p>
      </div>
      <div class='sticky-update-bar'>
        <button
          type='submit' 
          class='btn btn--primary border-box u-space-mt'
          ?disabled=${!this.settingsHaveChanged}>Save
        </button>
      </div>

    </form>
  </div>
`;}

function renderEmailSetting(setting) {
  let body = setting[0]; 
  let subject = setting[1];
  let key = setting[0].key.split("body_")[1];
  let pageSlug = this.toKebabCase(key);

  this.settingTypes[this.toCamelCase(key)] = key

  let vRes = this.getTemplatesVariables();
  let object = {label: this.toUpper(key), emailPrefix: this.toCamelCase(key)};

  return html`

  <div class="field-container" id='email-${pageSlug}' ?hidden=${setting.hidden}>
    <form @submit=${this._onFormSubmit}>
      <h4>${object.label}</h4>
          <email-template
            @email-update=${this._onEmailUpdate}
            .emailPrefix=${object.emailPrefix}
            .bodyTemplate=${body.value}
            .defaultBodyTemplate=${body.defaultValue}
            .defaultSubjectTemplate=${subject.defaultValue}
            .subjectTemplate=${subject.value}
            .disableNotification=${body.disable}
            .templateVariables=${vRes}
          ></email-template>
    </form>
  </div>
`;}