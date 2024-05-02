import express from 'express';
import settings from './settings.js';
import approverType from './approverType.js';


const router = express.Router();


// admin api routes
settings(router);
approverType(router);

export default (app) => {
  app.use('/admin', router);
}
