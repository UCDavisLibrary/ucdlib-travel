import logging from "../utils/emailLib/logging.js"
import nodemailer from "../utils/emailLib/nodemailer.js"
import settings from "../utils/emailLib/settings.js"
import Hydration from "../utils/emailLib/hydration.js"
import serverConfig from "../serverConfig.js";
import cron from 'node-cron';
import ApprovalRequest from './approvalRequest.js';

/**
 * @class Email
 * @description Controller for hydrating and sending emails from approval chain
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
      approvalRequestRevisionId: requests?.approvalRequestId || null,
      reimbursementRequestId: requests?.reimbursementRequestId || null,
      employeeKerberos: token?.preferred_username || null,
      subject: subject,
      emailSent: emailSent,
      details: details,
      notificationType: null
    };
  
    let result = await logging.addNotificationLogging(notification);

    if (result.error){ console.error('error logging notification', result) }

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
    const from = 'sabaggett@ucdavis.edu';//serverConfig.email.systemEmailAddress;
    const to = 'sabaggett@ucdavis.edu';//serverConfig.email.notificationRecipient || await hydration.getNotificationRecipient();
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
      email = await nodemailer.runEmail(emailMessage);


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
      approvalRequestRevisionId: approvalRequest?.approvalRequestRevisionId || null,
      reimbursementRequestId: reimbursementRequest?.reimbursementRequestId || null,
      employeeKerberos: token?.preferred_username || null,
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
   * @description formats the date either given or automatically the day
   * @param {String} date - date given
   * @returns {Array} year, day, month
   */
  formatDate(date = '') {
    
    let d = (date == '') ? new Date() : new Date(date);

    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();
    
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    return [year, month, day].join('-');
  }
    

  /**
   * @description get the notification history that is logged
   * @param {String} query - The role to check for
   * @returns {Object} res
   */
  async getHistory(query={}){
    //Format query if exists
    //Format for notification history

    let res = await logging.getNotificationLogging(query);

    return res;
  }

  /**
   * @description schedule emails on a day
   */
  async emailScheduler(){
      let approvalRequests = await ApprovalRequest.get({programEndDate: this.formatDate(), pageSize: -1});
      approvalRequests = approvalRequests.data.filter(a => a.approvalStatus === "approved");

      if(approvalRequests.length !== 0){
        for(let ar of approvalRequests) {
            const payloadFundedHours= {
              "requests": {
                approvalRequest: ar,
                reimbursementRequest: {},
              },
              token: null,
              notificationType: 'funded-hours' //notification type
            }
            
            await this.sendSystemNotification(payloadFundedHours.notificationType, 
              payloadFundedHours.requests.approvalRequest, 
              payloadFundedHours.requests.reimbursementRequest, 
              payloadFundedHours);   
        }  
      }

  }

  async emailDailyRunner(){
    if(serverConfig.email.enableCron) {
      cron.schedule("0 8 * * *", async () => {   
        this.emailScheduler();
      });
    }

  }
  
}

export default new Email();

