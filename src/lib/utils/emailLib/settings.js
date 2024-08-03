import emailController from "../../db-models/emailController.js";
import pg from "../../db-models/pg.js";
import dbSettings from "../../db-models/settings.js";

/**
 * @class Nodemailer
 * @description Utility class for querying the Settings based on notification type.
 * Does auth. 
 */
class Settings {

  constructor(){
  }

  _changeFormat(type){
    let changedType = type.replaceAll('-', '_');
    return changedType;
  }

  async _getTemplates(type){
    let changedType = this._changeFormat(type);
    let parse_body = 'admin_email_body_' + changedType;
    let parse_subject = 'admin_email_subject_' + changedType;


    /* This is real way to do it */
    let body = await dbSettings.getByKey(parse_body);
    let subject = await dbSettings.getByKey(parse_subject);


    return [body.defaultValue, subject.defaultValue]
  }

  async _getEmail(){

    /* This is real way to do it */
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

