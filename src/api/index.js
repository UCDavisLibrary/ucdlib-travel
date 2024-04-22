import express from 'express';
import config from '../lib/serverConfig.js';

import auth from './auth.js';
import employee from './employee.js';

const router = express.Router();

if ( config.auth.requireAuth ) {
  auth(router);
}

// routes
employee(router);

export default (app) => {
  app.use(config.apiRoot, router);
}
