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

    // Quick fix
    // const email = temp.filter((t) => t.key == "admin_email_address");

    /* This is real way to do it */
    let email = await dbSettings.getByKey("admin_email_address");

    return email.defaultValue;
  }



}
export default new Settings();

