// import { appConfig } from "../appGlobals.js";
import Logging from "../utils/emailLib/logging.js"
import Nodemailer from "../utils/emailLib/nodemailer.js"

// import settings from "./settings"
import Hydration from "../utils/emailLib/hydration.js"
import serverConfig from "../serverConfig.js";


/**
 * @description Class for accessing properties of an access token for this client
 */
class Email {
  constructor(data){
    this.data = data || {};
  }

  /**
   * @description Returns true if user has access to this client
   */
  get logging(){
    console.log(logging);
    return true;
  }

  /**
   * @description Returns true if user has basic access to this client
   */
  get nodemailer(){
    console.log(nodemailer);

    return true;
  }

  /**
   * @description Returns true if user has basic access to this client
   */
  // get settings(){
  //   return true;
  // }
 
 /**
   * @description Returns true if user has basic access to this client
   */
  get hydration(){
    console.log(hydration);

    return true;
  }


  /**
   * @description run the email function
   * @param {String} role - The role to check for
   * @param {Array|String} accessType - The role location. Can be 'realm', 'resource', or both.
   * @returns
   */
  createEmail(payload){
    //Hydrate keywords
    const hydration = new Hydration(payload.requests);
    payload.emailContent.subject = hydration.hydrate(payload.emailContent.subject);
    payload.emailContent.text = hydration.hydrate(payload.emailContent.text);


    //Form, Curate, and Send Message with Nodemailer
    const emailMessage = payload.emailContent;

    const mailer = new Nodemailer(emailMessage);
    mailer.runEmail();


    console.log("S:", serverConfig)
    //log it and send to database 
    let notification = {
      approvalRequestRevisionId: 0,
      reimbursementRequestId: 0,
      employeeKerberos: "sbagg",
      subject: payload.emailContent.subject,
      emailSent: true,
      details: {}
    };
    const logging = new Logging(payload);
    // logging.addNotificationLogging(notification);
    //return success
    return payload;
  }

  /**
   * @description get the email function
   * @param {String} role - The role to check for
   * @param {Array|String} accessType - The role location. Can be 'realm', 'resource', or both.
   * @returns
   */
  getHistory(query={active: true}){
    console.log("Queried");

      //Format query if exists
      //Use logger to run get on Notifications database
      //Format for notification history
      return "Queried";
    }
  
}

export default new Email();

