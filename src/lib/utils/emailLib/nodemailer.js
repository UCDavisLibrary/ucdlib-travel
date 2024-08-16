import serverConfig from "../../serverConfig.js";
import nodemailer from 'nodemailer';
 

/**
 * @class Nodemailer
 * @description Mailing class for sending notifications.
 * Does auth. 
 */
class Nodemailer {

  constructor(){
    this.transporter = nodemailer.createTransport({
      host: serverConfig.email.host,
      port: serverConfig.email.port,
      secure: serverConfig.email.secure,
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * @description run the email
   * @param {String} message - email text
   * @returns {Object} {info, error} email success status 
   */
  async runEmail(message){ 
    let out = {}; 
    try { 
      out.info = await this.transporter.sendMail(message); 
    } catch (error) { 
      out.error = error; 
    } 
    return out; 
  }


}
export default new Nodemailer();

