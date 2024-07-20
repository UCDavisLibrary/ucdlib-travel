import serverConfig from "../../serverConfig.js";
import nodemailer from 'nodemailer';

/**
 * @class Nodemailer
 * @description Utility class for querying the .
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

  async runEmail(message){
      await this.transporter.sendMail(message, (err, info) => {
            if (err) console.error(err);
            console.log(info);
            return info;

      });
    
  }


}
export default new Nodemailer();

