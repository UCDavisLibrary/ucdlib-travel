import express from 'express';

import fundingSource from './funding-source.js';
import lineItems from './line-items.js';
import settings from './settings.js';


const router = express.Router();


// admin api routes
fundingSource(router);
lineItems(router);
settings(router);

export default (app) => {
  app.use('/admin', router);
}
