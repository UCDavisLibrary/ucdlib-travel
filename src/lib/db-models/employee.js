import cache from "./cache.js";
import libraryIam from "../utils/LibraryIam.js";
import pg from "./pg.js";

/**
 * @class Employee
 * @description Class for querying employee data from the library IAM API.
 */
class Employee {

  constructor(){

    this.api = libraryIam;

    // DB cache keys
    this.cacheKeys = {
      singleEmployee: 'ucdlib-iam-employee'
    };
  }

  async getById(id, idType='username', skipCache=false) {
    const returnSingle = Array.isArray(id) ? false : true;
    const cacheType = `${this.cacheKeys.singleEmployee}--${idType}`;

    // create array of ids regardless of input type
    const ids = (Array.isArray(id) ? id : [id]).map(id => String(id)).map(id => id.trim()).filter(id => id);
    if ( ids.length === 0 ) {
      return pg.returnError('No employee ids provided.');
    }
    const recordsById = {};
    for ( const id of ids ) {
      recordsById[id] = null;
    }

    // Check cache
    if ( !skipCache ) {
      for (const id of ids) {
        const cacheRes = await cache.get(cacheType, id, this.apiConfig.serverCacheExpiration);
        if ( cacheRes.rows.length ) {
          recordsById[id] = cacheRes.rows[0].data;
        }
      }
    }

    // return if all records were found in cache
    const idsNotInCache = ids.filter(id => !recordsById[id]);
    if ( idsNotInCache.length === 0 ) {
      return returnSingle ? recordsById[ids[0]] : ids.map(id => recordsById[id]).filter(record => record);
    }

  }
}

export default new Employee();
