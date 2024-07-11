import express from 'express';
import config from '../lib/serverConfig.js';

import auth from './auth.js';

import admin from './admin/index.js';
import approvalRequest from './approvalRequest.js';
import department from './department.js';
import employee from './employee.js';
import reimbursementRequest from './reimbursementRequest.js';

const router = express.Router();

if ( config.auth.requireAuth ) {
  auth(router);
}

// routes
admin(router);
approvalRequest(router);
department(router);
employee(router);
reimbursementRequest(router);

export default (app) => {
  app.use(config.apiRoot, router);
}
