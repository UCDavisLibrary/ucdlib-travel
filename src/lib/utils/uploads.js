import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import config from "../serverConfig.js";
import authMiddleware from "./authMiddleware.js";
import reimbursementRequest from '../db-models/reimbursementRequest.js';
import approvalRequest from '../db-models/approvalRequest.js';
import typeTransform from './typeTransform.js';


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

  /**
   * @description Middleware to authorize viewing of uploaded receipts
   * @returns
   */
  async _authorizeReceiptUploadView(req, res, next){

    if ( !req.path.startsWith(path.normalize('/reimbursement-receipts'))){
      return next();
    }

    if ( req.auth.token.hasAdminAccess ) {
      return next();
    }

    // get receipt data for this file
    const filePath = `${config.uploadsRoot}${req.path}`;
    let receipt = await reimbursementRequest.getReceipts({filePath: [filePath]}, {returnReimbursementRequest: true});
    if ( receipt.error ){
      return res.status(500).json({error: 'Error retrieving receipt data.'});
    }
    if ( !receipt.length ){
      return res.status(404).json({error: 'Receipt not found.'});
    }

    // get approval request associated with receipt
    receipt = receipt[0];
    const approvalRequestId = typeTransform.toPositiveInt(receipt.reimbursementRequest?.approvalRequestId);
    if ( !approvalRequestId ) {
      return res.status(404).json({error: 'Receipt not found.'});
    }
    let approvalRequestData = await approvalRequest.get({requestIds: [approvalRequestId], isCurrent: true});
    if ( approvalRequestData.error ) {
      return res.status(500).json({error: 'Error retrieving approval request data.'});
    }
    if ( !approvalRequestData.total ) {
      return res.status(404).json({error: 'Receipt not found.'});
    }
    approvalRequestData = approvalRequestData.data[0];

    // check if user is authorized to view this receipt
    const isOwnRequest = approvalRequestData.employeeKerberos === req.auth.token.id;;
    const inApprovalChain = approvalRequestData.approvalStatusActivity.some(a => a.employeeKerberos === req.auth.token.id);
    if ( !isOwnRequest && !inApprovalChain ){
      return res.status(403).json({error: 'You are not authorized to view this receipt.'});
    }

  next();
  }
}

export default new Uploads();

