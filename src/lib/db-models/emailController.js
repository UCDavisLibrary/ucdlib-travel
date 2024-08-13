// import { appConfig } from "../appGlobals.js";
import logging from "../utils/emailLib/logging.js"
import nodemailer from "../utils/emailLib/nodemailer.js"
// import cron from 'node-cron';
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
   * @param {Object} sender - The recipient of the email from system
   * @param {Object} sub - Email Subject
   * @param {Object} body - Email Body
   * @param {Object} url - of request or reimbursement URL
   * @param {Object} payload - The object with email content and comments
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

    if ( text && subject && from && to && serverConfig.email.enabled ) {
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
      approvalRequestRevisionId: requests?.approvalRequestId,
      reimbursementRequestId: requests?.reimbursementRequestId,
      employeeKerberos: token?.preferred_username,
      subject: subject,
      emailSent: emailSent,
      details: details,
      notificationType: null
    };
  
    let result = await logging.addNotificationLogging(notification);

    return emailSent;
  }

  /**
   * @description run the system email function
   * @param {Object} notificationType - The type of the notification
   * @param {Object} approvalRequest - Approval Request
   * @param {Object} reimbursementRequest - Reimbursement Request
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
    const from = serverConfig.email.systemEmailAddress;
    const to = serverConfig.email.notificationRecipient || await hydration.getNotificationRecipient();
    const subject = hydration.hydrate(subjectTemplate);
    const text = hydration.hydrate(bodyTemplate);


    details.to = to;
    if ( to === serverConfig.email.notificationRecipient ){
      details.overwrittenTo = await hydration.getNotificationRecipient();
    }

    if ( bodyTemplate && subjectTemplate && from  && to && serverConfig.email.enabled ) {
      //Initiate Hydration class
      const emailMessage = {from, to, subject, text}
      let email;
      // Form, Curate, and Send Message with Nodemailer

      if(notificationType == 'funded-hours'){
        let day;
        if(approvalRequest.hasCustomTravelDates) { day = new Date(approvalRequest.travelEndDate) }
        else { day = new Date(approvalRequest.programEndDate) }

        const adjustedDatetime = day.setDate(day.getDate() + 1);
        const eventDatetimeObject = new Date(adjustedDatetime);

        const job = cron.schedule(eventDatetimeObject, async function(){
          email = await nodemailer.runEmail(emailMessage);
        });
        
        details.scheduled = job;
       
      }
      else {
        email = await nodemailer.runEmail(emailMessage);
      }

      if (email.error) {
        emailSent = false;
        details.error = email.error
      }

      emailSent = true;
    } else {
      emailSent = false;
    }

    details.to = to;
    details.from = from;


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

    if (result.error) {
      console.error( 'error writing notification log', notification, error);
    }

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

