import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';


export function render() { 
return html`

  <app-questions-or-comments page=${this.id} approvalRequestId=1></app-questions-or-comments>

  <div class='l-gutter l-container--narrow u-space-mb--large'>
    <ucd-theme-search-form
      placeholder='Search settings'
      class='u-space-mb'
      .value=${this.searchString}
      @search=${this._onSearch}>
    </ucd-theme-search-form>
    <div>
      ${this.settings.map(setting => renderEmailSetting.call(this, setting))}
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
  console.log("D:",setting);
  return html`
    <email-template

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