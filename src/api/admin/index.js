import express from 'express';
import settings from './settings.js';


const router = express.Router();


// admin api routes
settings(router);

export default (app) => {
  app.use('/admin', router);
}
