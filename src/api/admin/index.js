import express from 'express';

import approverType from './approverType.js';
import employeeAllocation from './employeeAllocation.js';
import fundingSource from './fundingSource.js';
import lineItems from './lineItems.js';
import settings from './settings.js';


const router = express.Router();


// admin api routes
approverType(router);
employeeAllocation(router);
fundingSource(router);
lineItems(router);
settings(router);

export default (app) => {
  app.use('/admin', router);
}
