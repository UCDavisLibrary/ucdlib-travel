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
  constructor(){}

  /**
   * @description run the email function
   * @param {Object} payload - The object with email content and approval and reimbursement requests
   * @returns {Object} status, id
   */
  async createEmail(payload){

    //Hydrate keywords
    const hydration = new Hydration(payload.requests.approvalRequest, payload.requests.reimbursementRequest);

    payload.emailContent.subject = hydration.hydrate(payload.emailContent.subject);
    payload.emailContent.text = hydration.hydrate(payload.emailContent.text);

    // //Form, Curate, and Send Message with Nodemailer
    const emailMessage = payload.emailContent;

    const mailer = new Nodemailer(emailMessage);
    mailer.runEmail();

    //log it and send to database 
    let notification = {
      approvalRequestRevisionId: payload.requests.approvalRequest.approvalRequestRevisionId || null,
      reimbursementRequestId: payload.requests.reimbursementRequest.reimbursementRequestId || null,
      employeeKerberos: payload.requests.token.preferred_username,
      subject: payload.emailContent.subject,
      emailSent: true,
      details: payload,
      notificationType: payload.requests.type
    };

    const logging = new Logging();
    let result = await logging.addNotificationLogging(notification);

    return result;
  }

  /**
   * @description get the email function
   * @param {String} query - The role to check for
   * @param {Array|String} accessType - The role location. Can be 'realm', 'resource', or both.
   * @returns
   */
  async getHistory(query={email_sent: true}){
      //Format query if exists
      //Use logger to run get on Notifications database
      //Format for notification history

    const logging = new Logging();
    let res = await logging.getNotificationLogging(query);


    return res;
  }
  
}

export default new Email();

