/**
 * @description Server configuration file. Reads environment variables and sets defaults.
 * To pass any of these variables to the browser, see static.js
 */
class ServerConfig {
  constructor() {

    this.version = this.getEnv('APP_VERSION', '0.0.9');
    this.env = process?.env?.APP_ENV === 'dev' ? 'dev' : 'prod';

    this.title = this.getEnv('APP_TITLE', 'Travel, Training, and Professional Development');

    this.routes = ['approval-request', 'approve', 'reimbursement', 'reports', 'admin'];

    this.apiRoot = this.getEnv('APP_API_ROOT', '/api');

    this.port = {
      container: this.getEnv('APP_CONTAINER_PORT', 3000), // server port within docker container
      host: this.getEnv('APP_HOST_PORT', 3000), // server port on host machine
    }

    this.assetFileNames = {
      css: 'ucdlib-travel.css',
      js: 'ucdlib-travel.js'
    }

    // sets robots meta tag to discourage search engines from indexing the site
    this.discourageRobots = this.getEnv('APP_DISCOURAGE_ROBOTS', true);

    // Made available to the browser-side app, so don't put any secrets here.
    this.auth = {
      // forces browser-side authentication. Browser then passes auth token to server.
      requireAuth: this.getEnv('APP_REQUIRE_AUTH', true),

      // passed to the browser-side keycloak library initialization
      keycloakJsClient: {
        url: this.getEnv('APP_KEYCLOAK_URL', 'https://auth.library.ucdavis.edu'),
        realm: this.getEnv('APP_KEYCLOAK_REALM', 'internal'),
        clientId: this.getEnv('APP_KEYCLOAK_CLIENT_ID', 'travel-app')
      },
      oidcScope: this.getEnv('APP_OIDC_SCOPE', 'profile ucd-ids'),
      serverCacheExpiration: this.getEnv('APP_SERVER_CACHE_EXPIRATION', '12 hours')
    };

    this.libraryIamApi = {
      url: this.getEnv('UCDLIB_PERSONNEL_API_USER_URL', 'https://iam.staff.library.ucdavis.edu/json'),
      user: this.getEnv('UCDLIB_PERSONNEL_API_USER', ''),
      key: this.getEnv('UCDLIB_PERSONNEL_API_KEY', ''),
      serverCacheExpiration: this.getEnv('UCDLIB_PERSONNEL_API_CACHE_EXPIRATION', '24 hours')
    }
  }

  /**
   * @description Get an environment variable.  If the variable is not set, return the default value.
   * @param {String} name - The name of the environment variable.
   * @param {*} defaultValue - The default value to return if the environment variable is not set.
   * @returns
   */
  getEnv(name, defaultValue=false){
    let v;
    const env = process?.env?.[name]
    if ( env ) {
      if ( env.toLowerCase() == 'true' ) return true;
      if ( env.toLowerCase() == 'false' ) return false;
      return env;
    }
    return defaultValue;
  }
}

export default new ServerConfig();
