import settings from "../../db-models/settings.js";
import pg from "../../db-models/pg.js";

/**
 * @class Nodemailer
 * @description Utility class for querying the Settings based on notification type.
 * Does auth. 
 */
class Settings {

  constructor(){
    // await settings.getByCategory("admin-email-settings");
  }

  _changeFormat(type){
    let changedType = type.replaceAll('-', '_');
    return changedType;
  }

  _parsetype(type){
    let changedType = this._changeFormat(type);
    let parse_body = 'admin_email_body_' + changedType;
    let parse_subject = 'admin_email_subject_' + changedType;
4
    return [parse_body, parse_subject]
  }

  async _getTemplates(type){
    let [parse_body, parse_subject] = this._parsetype(type);

    let body = await settings.getByKey(parse_body);
    let subject = await settings.getByKey(parse_subject);

    console.log("C:",body);
    console.log("D:",subject);
    return [body, subject]
}

//   getNotificationRecipient(type){
//     this._changeFormat(type);
//     let system_email = 'admin_email_recipient_' + changedType;
//     let email =  settings.getByKey(system_email).default_value;

//     return email;
//   }


}
export default new Settings();

