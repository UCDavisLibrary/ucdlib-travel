import serverConfig from "../../serverConfig.js";
import pg from "../../db-models/pg.js";
import fetch from 'node-fetch';
import { createTransport, createTestAccount, getTestMessageUrl } from "nodemailer";
import nodemailer from 'nodemailer';

/**
 * @class Nodemailer
 * @description Utility class for querying the .
 * Does auth. 
 */
export default class Nodemailer {

  constructor(payload = {}){
    this.message = payload;


// off by default unless env (turn n email flag)
      // console.log("P", process.env);
    // if (process.env.APP_ENV !== 'production') {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.lib.ucdavis.edu',
          port: 25,
          secure: false,
          tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
          },
        });
        this.verifyTransport();
      // }

  }

  async runEmail(){
    this.transporter.sendMail(this.message, (err, info) => {
          console.log(info.envelope);
          console.log(info.messageId);
    });
  }

  verifyTransport(){
    this.transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
  } 


}
