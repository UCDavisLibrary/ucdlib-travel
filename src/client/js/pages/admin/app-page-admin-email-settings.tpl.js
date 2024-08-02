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
  let body = setting[0]; 
  let subject = setting[1];

  // const variablesBody = body.defaultValue.split('${').slice(1).map(x => x.split('}')[0]);
  // const variablesSubject = body.defaultValue.split('${').slice(1).map(x => x.split('}')[0]);

  // let v = variablesBody.concat(variablesSubject);
  // const variables = [...new Set(v)];
  
  let vRes = [];
  for (let v of this.variableList) {
    const result = v.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    vRes.push({key: v, label: finalResult });
  }

  return html`
    <email-template
      .defaultBodyTemplate=${body.defaultValue}
      .defaultSubjectTemplate=${subject.defaultValue}
      .templateVariables=${vRes}
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