// import { appConfig } from "../appGlobals.js";
import logging from "./logging"
import nodemailer from "./nodemailer"
// import settings from "./settings"
import hydration from "./hydration"


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
    return true;
  }

  /**
   * @description Returns true if user has basic access to this client
   */
  get nodemailer(){
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
    return true;
  }


  /**
   * @description run the email function
   * @param {String} role - The role to check for
   * @param {Array|String} accessType - The role location. Can be 'realm', 'resource', or both.
   * @returns
   */
  createEmail(payload){
    console.log("Pay:",payload);
    //Format email
    //Hydrate keywords
    //send email - Nodemailer
    //log it
    //send log to database
    //return success
    return payload;
  }

  /**
   * @description get the email function
   * @param {String} role - The role to check for
   * @param {Array|String} accessType - The role location. Can be 'realm', 'resource', or both.
   * @returns
   */
    getEmails(query={}){
      //Format query if exists
      //Use logger to run get on Notifications database
      //Format for notification history
      return payload;
    }
  
}

export default new Email();

