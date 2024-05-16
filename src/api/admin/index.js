import express from 'express';

import employeeAllocation from './employee-allocation.js';
import fundingSource from './funding-source.js';
import lineItems from './line-items.js';
import settings from './settings.js';
import approverType from './approverType.js';


const router = express.Router();


// admin api routes
employeeAllocation(router);
fundingSource(router);
lineItems(router);
settings(router);
approverType(router);

export default (app) => {
  app.use('/admin', router);
}
