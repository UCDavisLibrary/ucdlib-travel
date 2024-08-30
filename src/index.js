import express from 'express';
import cookieParser from 'cookie-parser'
import serverConfig from './lib/serverConfig.js';
import setUpStaticRoutes from './lib/static.js';
import setUpApiRoutes from "./api/index.js"
import uploads from "./lib/utils/uploads.js";
import emailController from './lib/db-models/emailController.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

// setup api routes
setUpApiRoutes(app);

// setup static app routes including spa
setUpStaticRoutes(app);

// setup uploads routes
uploads.setUpRoutes(app);

emailController.emailDailyRunner();

const port = serverConfig.port.container;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
