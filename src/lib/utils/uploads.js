import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import config from "../serverConfig.js";
import authMiddleware from "./authMiddleware.js";


/**
 * @description Methods for setting up and managing user file upload functionality
 */
class Uploads {

  /**
   * @description Set up routes for handling file uploads
   * @param {*} app - The express app
   */
  setUpRoutes(app){
    const router = express.Router();

    // auth middleware
    router.use(async (req, res, next) => {
      await authMiddleware(req, res, next);
    });
    router.use(async (req, res, next) => {
      await this._authorizeReceiptUploadView(req, res, next);
    });

    // static uploads
    router.use(express.static(config.uploadsRoot));

    app.use(config.uploadsRoot, router);
  }


  /**
   * @description Middleware for uploading receipts for a reimbursement request
   * @returns
   */
  uploadReiumbursementReceipts(){
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const path = `${config.uploadsDir}/reimbursement-receipts/${year}/${month}/${day}`;
        fs.mkdirSync(path, { recursive: true });
        cb(null, path)
      },
      filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const extension = file.originalname.split('.').pop();
        cb(null, uniqueName + '.' + extension)
      }
    })
    const upload = multer({ storage: storage })
    return upload.array('receiptUploads');
  }

  /**
   * @description Delete uploaded files
   * @param {Array} files - req.files array
   */
  deleteUploadedFiles(files){
    if ( !Array.isArray(files) ) return;
    files.forEach(file => {
      const path = file.path;
      if ( path && fs.existsSync(path) ){
        fs.unlinkSync(path);
      }
    });
  }

  async _authorizeReceiptUploadView(req, res, next){

    if ( req.path.startsWith(path.normalize('/reimbursement-receipts'))){

      // todo: check if user has access to view this file
      // return res.status(403).json({error: 'Not authorized to view this file.'});
    }
    next();
  }


}

export default new Uploads();

