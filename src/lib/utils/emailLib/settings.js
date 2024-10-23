import dbSettings from "../../db-models/settings.js";

/**
 * @class Settings
 * @description Get data for email from settings database
 */
class Settings {

  constructor(){
  }

  /**
   * @description change the format of the keyword
   * @param {String} type - keyword type
   * @returns {Object} changed format of keyword
   */
  _changeFormat(type){
    let changedType = type.replaceAll('-', '_');
    return changedType;
  }

  /**
   * @description run the email
   * @param {String} type - email text
   * @returns {Array}[body, subject] default values
   */
  async _getTemplates(type){
    let changedType = this._changeFormat(type);
    let parse_body = 'admin_email_body_' + changedType;
    let parse_subject = 'admin_email_subject_' + changedType;


    let body = await dbSettings.getByKey(parse_body);
    let subject = await dbSettings.getByKey(parse_subject);

    body = body.useDefaultValue ? body.defaultValue : body.value;
    subject = subject.useDefaultValue ? subject.defaultValue : subject.value;

    return [body, subject]
  }

  /**
   * @description run the email
   * @returns {String} Email value
   */
  async _getEmail(){

    let email = await dbSettings.getByKey("admin_email_address");

    if(!email) return;
    if ( email.error) {
      console.error('Error getting email object', email.error);
      return email.error;
    }

    if(email.useDefaultValue) return email.defaultValue;

    return email.value;
  }



}
export default new Settings();

