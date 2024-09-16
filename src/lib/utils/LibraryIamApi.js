import serverConfig from "../serverConfig.js";
import pg from "../db-models/pg.js";
import fetch from 'node-fetch';
import cron from 'node-cron';
import log from './log.js';

/**
 * @class LibraryIamApi
 * @description Utility class for querying the library IAM API.
 * Does auth.
 */
class LibraryIamApi {

  constructor(){

    // Credentials from env file
    this.config = serverConfig.libraryIamApi;
    this.configured = (this.config.url && this.config.user && this.config.key) ? true : false;
    this.configuredError = 'Library IAM API not configured in env file. Cannot query employee data.';
  }

  /**
   * @description Start the cron job to update the database with the latest IAM API data.
   * Archives departments and employees that are no longer in the IAM API.
   * Not mission critical, so errors are logged but not thrown.
   */
  startCron(){
    if ( this.config.enableCron ){
      cron.schedule(this.config.cronSchedule, async () => {
        const logOutput = {
          process: 'Library IAM API cron job',
          message: 'process started',
          started: new Date()
        };
        try {
          log.log(logOutput);

          const departmentUpdate = await this.archiveDepartments();
          if ( departmentUpdate.error ){
            throw departmentUpdate.error;
          }
          logOutput.departmentUpdate = {
            complete: true,
            departments: departmentUpdate
          };

          const employeeUpdate = await this.archiveEmployees();
          if ( employeeUpdate.error ){
            throw employeeUpdate.error;
          }
          logOutput.employeeUpdate = {
            complete: true,
            employees: employeeUpdate
          };

          logOutput.message = 'process complete';
        } catch (error) {
          logOutput.message = 'Error in Library IAM API cron job';
          logOutput.error = error;
        }
        logOutput.ended = new Date();
        log.log(logOutput);
      });
    }
  }

  /**
   * @description Archive employees in the database that are no longer in the IAM API
   * @returns {Array} Array of employees that were updated. Each object has kerberos, archived, and update properties.
   */
  async archiveEmployees(){
    const dbEmployees = await pg.query(`SELECT kerberos, archived FROM employee`);
    if ( dbEmployees.error ) {
      return dbEmployees;
    }
    const iamEmployees = await this.get('/employees');
    if ( iamEmployees.error ) {
      return iamEmployees;
    }

    // compare status of db employees to iam
    const comparison = dbEmployees.res.rows.map(dbEmployee => {
      const out = {kerberos: dbEmployee.kerberos, archived: dbEmployee.archived, update: false};
      const iamEmployee = iamEmployees.res.find(iamEmployee => iamEmployee.user_id == dbEmployee.kerberos);
      if ( !iamEmployee && !dbEmployee.archived ) {
        out.update = true;
        out.archived = true;
      }
      if ( iamEmployee && dbEmployee.archived ){
        out.update = true;
        out.archived = false;
      }
      return out;
    }).filter(c => c.update);

    // update employees
    if ( comparison.length ) {
      const updates = comparison.map(c => {
        return pg.query(`UPDATE employee SET archived = $1 WHERE kerberos = $2`, [c.archived, c.kerberos]);
      });
      const updateResults = await Promise.all(updates);
      if ( updateResults.some(r => r.error) ) {
        return {error: new Error('Error updating employee archive status')};
      }
    }

    return comparison;
  }

  /**
   * @description Archive departments in the database that are archived in the IAM API
   * @returns {Array} Array of departments that were updated. Each object has departmentId, archived, and update properties.
   */
  async archiveDepartments(){
    const dbDepartments = await pg.query(`SELECT department_id, archived FROM department`);
    if ( dbDepartments.error ) {
      return dbDepartments;
    }
    const iamDepartments = await this.get('/groups', {'filter-part-of-org': true});
    if ( iamDepartments.error ) {
      return iamDepartments;
    }

    // compare archive status of each department
    const comparison = dbDepartments.res.rows.map(dbDepartment => {
      const out = {departmentId: dbDepartment.department_id, archived: dbDepartment.archived, update: false};
      const iamDepartment = iamDepartments.res.find(iamDepartment => iamDepartment.id == dbDepartment.department_id);
      if ( !iamDepartment && !dbDepartment.archived ) {
        out.update = true;
        out.archived = true;
      } else if ( iamDepartment.archived != dbDepartment.archived ) {
        out.update = true;
        out.archived = iamDepartment.archived;
      }
      return out;
    }).filter(c => c.update);

    // update departments
    if ( comparison.length ) {
      const updates = comparison.map(c => {
        return pg.query(`UPDATE department SET archived = $1 WHERE department_id = $2`, [c.archived, c.departmentId]);
      });
      const updateResults = await Promise.all(updates);
      if ( updateResults.some(r => r.error) ) {
        return {error: new Error('Error updating department archive status')};
      }
    }

    return comparison;
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

  /**
   * @description Send GET request to Library IAM API
   * @param {String} url - URL path
   * @param {Object} searchParams - URL search parameters
   * @param {Object} options - Fetch options
   * @returns {Object} {res, error}
   */
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
      //console.log(`${baseUrl}${url}`);
      const response = await fetch(`${baseUrl}${url}`, {
        headers: {
          'Authorization': this.getAuthorizationHeader(),
          'Content-Type': 'application/json'
        },
        ...options
      });

      if ( response.ok ) {
        return {res: await response.json()};
      } else {
        throw new HTTPResponseError(response);
      }
    }
    catch (error) {
      return {error};
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


export default new LibraryIamApi();
