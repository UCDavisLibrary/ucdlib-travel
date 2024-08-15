import path from 'path';
import spaMiddleware from '@ucd-lib/spa-router-middleware';
import config from './serverConfig.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (app) => {
  let assetsDir = path.join(__dirname, '../client/public');
  const bundle = `
    <link rel="stylesheet" href="/css/${config.assetFileNames.css}?v=${config.version}">
    <script src='/js/${config.env == 'dev' ? 'dev' : 'dist'}/${config.assetFileNames.js}?v=${config.version}'></script>
  `;
  const robots = config.discourageRobots ? `<meta name="robots" content="noindex, nofollow">`: '';
  const routes = [...config.routes];
  if ( config.auth.requireAuth ) {
    routes.push('logout');
  }

  // For config options, see https://github.com/UCDavisLibrary/spa-router-middleware
  spaMiddleware({
    app,
    htmlFile : path.join(assetsDir, 'index.html'),
    isRoot : true,
    appRoutes : routes,
    static : {
      dir : assetsDir
    },
    enable404 : false,

    getConfig : async (req, res, next) => {
      next({
        routes : routes,
        apiRoot : config.apiRoot,
        version: config.version,
        title: config.title,
        auth: {
          requireAuth: config.auth.requireAuth,
          clientInit: config.auth.keycloakJsClient,
          oidcScope: config.auth.oidcScope
        },
        logger: config.logger
      });
    },

    template : (req, res, next) => {
      next({
        title: config.title,
        bundle,
        robots
      });
    }
  });
};
