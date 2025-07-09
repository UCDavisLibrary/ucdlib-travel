import corkBuild from "./utils/corkBuild.js";

/**
 * @description Server configuration file. Reads environment variables and sets defaults.
 * To pass any of these variables to the browser, see static.js
 */
class ServerConfig {
  constructor() {

    this.version = corkBuild.version;
    this.env = process?.env?.APP_ENV === 'dev' ? 'dev' : 'prod';

    this.title = this.getEnv('APP_TITLE', 'Travel, Training, and Professional Development');

    this.routes = ['approval-request', 'approve', 'reimbursement-request', 'reports', 'admin'];

    this.apiRoot = this.getEnv('APP_API_ROOT', '/api');
    this.appRoot = process?.env?.APP_ROOT_URL;

    this.uploadsRoot = this.getEnv('APP_UPLOADS_ROOT', '/uploads');
    this.uploadsDir = this.getEnv('APP_UPLOADS_DIR', '/uploads');

    this.featureFlags = {
      reimbursementRequest: this.getEnv('APP_ENABLE_REIMBURSEMENT_REQUEST', false)
    }

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
      serverCacheExpiration: this.getEnv('UCDLIB_PERSONNEL_API_CACHE_EXPIRATION', '24 hours'),
      enableCron: this.getEnv('UCDLIB_PERSONNEL_API_ENABLE_CRON', false),
      cronSchedule: this.getEnv('UCDLIB_PERSONNEL_API_CRON_SCHEDULE', '0 1 * * *')
    }

    this.email = {
      host: this.getEnv('APP_SMTP_HOST', 'smtp.lib.ucdavis.edu'),
      port: this.getEnv('APP_SMTP_PORT', '25'),
      secure: this.getEnv('APP_SMTP_SECURE', false),
      enabled: this.getEnv('APP_SEND_EMAIL_NOTIFICATIONS', false),
      systemEmailAddress: this.getEnv('APP_SMTP_SYSTEM_EMAIL_ADDRESS', ''),
      notificationRecipient: this.getEnv('APP_SMTP_NOTIFICATION_EMAIL_ADDRESS', ''),
      enableCron: this.getEnv('APP_SMTP_ENABLE_CRON', false)
    }

    this.logger = {
      logLevel: this.getEnv('APP_LOGGER_LOG_LEVEL', 'info'),
      logLevels: {},
      disableCallerInfo: this.getEnv('APP_LOGGER_DISABLE_CALLER_INFO', false),
      reportErrors: {
        enabled: this.getEnv('APP_REPORT_ERRORS_ENABLED', false),
        url: this.getEnv('APP_REPORT_ERRORS_URL', ''),
        method: this.getEnv('APP_REPORT_ERRORS_METHOD', 'POST'),
        key: this.getEnv('APP_REPORT_ERRORS_KEY', ''),
        headers: {},
        sourceMapExtension: this.getEnv('APP_REPORT_ERRORS_SOURCE_MAP_EXTENSION', '.map'),
        customAttributes: {appOwner: 'itis', appName: 'travel-app'}
      }
    }

    this.backup = {
      tableName: this.getEnv('BACKUP_LOG_TABLE'),
      statusFailAfterInterval: this.getEnv('BACKUP_LOG_STATUS_FAIL_AFTER_INTERVAL', '2 days')
    }
  }

  /**
   * @description Print the current status of the server configuration to the console.
   */
  printStatus() {
    console.log('Error Reporting:', this.logger.reportErrors.enabled ? 'Enabled' : 'Disabled');
    console.log('Email Notifications:', this.email.enabled ? 'Enabled' : 'Disabled');
    console.log('Email Cron:', this.email.enableCron ? 'Enabled' : 'Disabled');
    console.log('System Email Address:', this.email.systemEmailAddress);
    console.log('Notification Recipient Override:', this.email.notificationRecipient);
    console.log('Library IAM Cron:', this.libraryIamApi.enableCron ? 'Enabled' : 'Disabled');
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
