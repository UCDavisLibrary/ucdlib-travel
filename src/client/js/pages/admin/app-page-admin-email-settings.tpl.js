import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';


export function render() { 
  const group = this.sortSettings()
return html`
  <div class='l-gutter l-container--narrow u-space-mb--large'>
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
        class='btn btn--primary'
        ?disabled=${!this.settingsHaveChanged}
        @click=${this._onSaveSettings}>Save</button>
    </div>
  </div>
`;}

function renderEmailSetting(setting) {
  //const variables = content.split('${').slice(1).map(x => x.split('}')[0]);
  console.log("S:", setting);
  return html`
    <email-template
      .defaultBodyTemplate=${setting[0].defaultValue}
      .defaultSubjectTemplate=${setting[1].defaultValue}
    ></email-template>
`;}



// @email-update=${this._onEmailUpdate}
// .emailPrefix=${setting.emailPrefix}
// .bodyTemplate=${setting.body.value}
// .defaultBodyTemplate=${setting.body.default}
// .defaultSubjectTemplate=${setting.subject.default}
// .subjectTemplate=${setting.subject.value}
// .disableNotification=${setting.disable.value}
// .templateVariables=${setting.body.templateVariables}