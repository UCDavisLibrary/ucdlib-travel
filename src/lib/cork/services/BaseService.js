import { BaseService } from '@ucd-lib/cork-app-utils';
import { appConfig } from '../../appGlobals.js';

/**
 * @class BaseServiceImp
 * @description Extends the cork-app-utils BaseService to add auth headers to requests
 * Import this class instead of BaseService directly from @ucd-lib/cork-app-utils
 */
export default class BaseServiceImp extends BaseService {
  constructor() {
    super();
  }

  /**
   * @description Adds auth headers to request before calling super.request
   * @param {Object} options - request options
   * @returns
   */
  async request(options){
    if( appConfig.auth?.keycloakClient ) {
      const kc = appConfig.auth.keycloakClient;
      if( !options.fetchOptions ) options.fetchOptions = {};
      if( !options.fetchOptions.headers ) options.fetchOptions.headers = {};
      try {
        await kc.updateToken(10);
        options.fetchOptions.headers.Authorization = `Bearer ${kc.token}`
      } catch (error) {}
    }

    if( options.json &&
      options.fetchOptions &&
      options.fetchOptions.body &&
      typeof options.fetchOptions.body === 'object' &&
      !Array.isArray(options.fetchOptions.body) ){
        options.fetchOptions.body = {...options.fetchOptions.body};
        delete options.fetchOptions.body.validationHandler
    }
    //return await super.request(options);
    return super.request(options);
  }
}
