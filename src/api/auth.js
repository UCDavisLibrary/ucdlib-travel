import authMiddleware from "../lib/utils/authMiddleware.js";
import cache from "../lib/db-models/cache.js";

export default (api) => {

  api.use(async (req, res, next) => {
    await authMiddleware(req, res, next);
  });

  api.get('/auth/clear-cache', async (req, res) => {

    const response = await cache.delete('accessToken', req.auth.token.id);
    const success = response.error ? false : true;
    if ( !success ) console.error('Unable to clear access token cache: ', response.error);

    res.json({success});

  });
}
