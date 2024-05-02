import express from 'express';

import lineItems from './line-items.js';
import settings from './settings.js';
import approverType from './approverType.js';


const router = express.Router();


// admin api routes
lineItems(router);
settings(router);
approverType(router);

export default (app) => {
  app.use('/admin', router);
}
