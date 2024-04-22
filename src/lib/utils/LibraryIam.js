import serverConfig from "../serverConfig.js";
import pg from "../db-models/pg.js";
import fetch from 'node-fetch';

/**
 * @class LibraryIam
 * @description Utility class for querying the library IAM API.
 * Does auth.
 */
class LibraryIam {

  constructor(){

    // Credentials from env file
    this.config = serverConfig.libraryIam;
    this.configured = (this.config.url && this.config.user && this.config.key) ? true : false;
    this.configuredError = 'Library IAM API not configured in env file. Cannot query employee data.';
  }

  /**
   * @description Log the configuration error to the console.
   */
  logConfigError(){
    console.error(this.configuredError);
  }

  /**
   * @description Get the Authorization header for the Library IAM API
   * @returns {String} Authorization header for IAM API
   */
  getAuthorizationHeader(){
    const auth = Buffer.from(`${this.config.user}:${this.config.key}`).toString('base64');
    return `Basic ${auth}`;
  }

  async get(url, searchParams={}, options={}){
    if ( !this.configured ) {
      this.logConfigError();
      return pg.returnError(this.configuredError);
    }

    // remove trailing slash
    if ( url.endsWith('/') ) url = url.slice(0, -1);
    const baseUrl = this.config.url.endsWith('/') ? this.config.url.slice(0, -1) : this.config.url;

    // add search params
    const searchParamsString = new URLSearchParams(searchParams).toString();
    if ( searchParamsString ) url += `?${searchParamsString}`;

    try {
      const response = await fetch(`${baseUrl}${url}`, {
        headers: {
          'Authorization': this.getAuthorizationHeader(),
          'Content-Type': 'application/json'
        },
        ...options
      });

      if ( response.ok ) {
        return response.json();
      } else {
        throw new HTTPResponseError(response);
      }
    }
    catch (error) {
      return pg.returnError(error.message);
    }


  }


}

class HTTPResponseError extends Error {
	constructor(response) {
		super(`HTTP Error Response: ${response.status} ${response.statusText}`);
		this.response = response;
    this.is404 = response.status == 404;
	}
}


export default new LibraryIam();
