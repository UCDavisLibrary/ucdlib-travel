// import { appConfig } from "../appGlobals.js";
import logging from "../utils/emailLib/logging.js"
import nodemailer from "../utils/emailLib/nodemailer.js"

import settings from "../utils/emailLib/settings.js"
import Hydration from "../utils/emailLib/hydration.js"
import serverConfig from "../serverConfig.js";


/**
 * @description Class for accessing properties of an access token for this client
 */
class Email {
  constructor(){}

  /**
   * @description run the questions/comments help email function
   * @param {Object} payload - The object with email content and approval and reimbursement requests
   * @returns {Object} status, id
   */
   async sendHelpEmail(sender, sub, body, url, payload) {
    let requests = payload.requests;
    let token = payload.token;

    let emailSent;
    let details = {};
    body = body + `\n${serverConfig.appRoot}/${url}`

    const from = sender;
    const to = await settings._getEmail(); // This is getting the email to send help too currently donotreply@lib.ucdavis.edu
    const subject = sub;
    const text = body;

    if ( text && subject && from && serverConfig.email.enabled ) {
      //Initiate Hydration class
      const emailMessage = {from, to, subject, text}

      // Form, Curate, and Send Message with Nodemailer
      let email = await nodemailer.runEmail(emailMessage);
      console.log("E:", email);
        if (email.error) {
          emailSent = false;
          details.error = email.error
        }

        emailSent = true;
    } else {
      emailSent = false;
    }


    // //log it and send to database 
    let notification = {
      approvalRequestRevisionId: requests?.approvalRequest,
      reimbursementRequestId: requests?.reimbursementRequest,
      employeeKerberos: token?.preferred_username,
      subject: subject,
      emailSent: emailSent,
      details: details,
      notificationType: null
    };
  
    let result = await logging.addNotificationLogging(notification);

    return result;
  }

  /**
   * @description run the email function
   * @param {Object} payload - The object with email content and approval and reimbursement requests
   * @returns {Object} status, id
   */
  async sendSystemNotification(notificationType, approvalRequest, reimbursementRequest, payload){ 
    let emailSent;
    let details = {};
    let token = payload.token;

    //Go into the settings and get the template for the situation
    const [bodyTemplate, subjectTemplate] =  await settings._getTemplates(notificationType); 

    const hydration = new Hydration(approvalRequest, reimbursementRequest, notificationType);

    //Hydrate keywords
    const from = 'sabaggett@ucdavis.edu';//serverConfig.email.systemEmailAddress;
    const to = 'sabaggett@ucdavis.edu';//await hydration.getNotificationRecipient() 
    const subject = hydration.hydrate(subjectTemplate);
    const text = hydration.hydrate(bodyTemplate);

    if ( bodyTemplate && subjectTemplate && from && serverConfig.email.enabled ) {
      //Initiate Hydration class
      const emailMessage = {from, to, subject, text}

    // Form, Curate, and Send Message with Nodemailer
    let email = await nodemailer.runEmail(emailMessage);
      if (email.error) {
        emailSent = false;
        details.error = email.error
      }

      emailSent = true;
    } else {
      emailSent = false;
    }


    // Log it and send to database 
    let notification = {
      approvalRequestRevisionId: approvalRequest.approvalRequestRevisionId || null,
      reimbursementRequestId: reimbursementRequest.reimbursementRequestId || null,
      employeeKerberos: token.preferred_username,
      subject: subject,
      emailSent: emailSent,
      details: details,
      notificationType: notificationType
    };

    let result = await logging.addNotificationLogging(notification);

    return result;
  }

  /**
   * @description get the email function
   * @param {String} query - The role to check for
   * @param {Array|String} accessType - The role location. Can be 'realm', 'resource', or both.
   * @returns
   */
  async getHistory(query={}){
    //Format query if exists
    //Format for notification history

    let res = await logging.getNotificationLogging(query);


    return res;
  }
  
}

export default new Email();

