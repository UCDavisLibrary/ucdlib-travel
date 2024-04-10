/**
 * @description Server configuration file. Reads environment variables and sets defaults.
 * To pass any of these variables to the browser, see static.js
 */
class ServerConfig {
  constructor() {

    this.version = this.getEnv('APP_VERSION', '0.0.9');
    this.env = process?.env?.APP_ENV === 'dev' ? 'dev' : 'prod';

    // TODO: Replace these with your own app title
    this.title = this.getEnv('APP_TITLE', 'UC Davis Library Simple SPA');

    // TODO: Replace these with the routes that your SPA should handle
    this.routes = ['foo'];

    this.apiRoot = this.getEnv('APP_API_ROOT', '/api');

    this.port = {
      container: this.getEnv('APP_CONTAINER_PORT', 3000), // server port within docker container
      host: this.getEnv('APP_HOST_PORT', 3000), // server port on host machine
    }

    // TODO: Replace these with your own app slug
    this.assetFileNames = {
      css: 'ucdlib-simple-spa.css',
      js: 'ucdlib-simple-spa.js'
    }

    // sets robots meta tag to discourage search engines from indexing the site
    this.discourageRobots = this.getEnv('APP_DISCOURAGE_ROBOTS', true);

    // TODO: Review auth settings
    // Made available to the browser-side app, so don't put any secrets here.
    this.auth = {
      // forces browser-side authentication. Browser then passes auth token to server.
      requireAuth: this.getEnv('APP_REQUIRE_AUTH', true),

      // passed to the browser-side keycloak library initialization
      keycloakJsClient: {
        url: this.getEnv('APP_KEYCLOAK_URL', 'https://sandbox.auth.library.ucdavis.edu'),
        realm: this.getEnv('APP_KEYCLOAK_REALM', 'internal'),
        clientId: this.getEnv('APP_KEYCLOAK_CLIENT_ID', 'simple-spa-client')
      },
      oidcScope: this.getEnv('APP_OIDC_SCOPE', 'profile roles ucd-ids'),
      serverCacheExpiration: this.getEnv('APP_SERVER_CACHE_EXPIRATION', '10 minutes')
    };
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
