import express from 'express';
import settings from './settings.js';


const router = express.Router();


// The entire /api/admin section is protected by the hasAdminAccess AccessToken method
router.use((req, res, next) => {
  const auth = req.auth;
  if ( !auth?.token || !auth.token.hasAdminAccess ) {
    res.status(403).json({
      error: true,
      message: 'Not authorized to access this resource.'
    });
    return;
  }
  next();
});

// admin api routes
settings(router);

export default (app) => {
  app.use('/admin', router);
}
