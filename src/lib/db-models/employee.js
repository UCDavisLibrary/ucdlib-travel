import cache from "./cache.js";
import libraryIamApi from "../utils/LibraryIamApi.js";
import pg from "./pg.js";

/**
 * @class Employee
 * @description Class for querying data about library employees
 */
class Employee {

  constructor(){

    this.api = libraryIamApi;

    // DB cache keys
    this.cacheKeys = {
      singleEmployee: 'ucdlib-iam-employee',
      employeeQuery: 'ucdlib-iam-employees',
      titleCodes: 'ucdlib-iam-title-codes'
    };

    this.idTypes = [
      {methodParam: 'user-id', responseProp: 'user_id', name: 'Kerberos ID'},
      {methodParam: 'iam-id', responseProp: 'iam_id', name: 'UCD IAM ID'},
      {methodParam: 'email', responseProp: 'email', name: 'Email'},
      {methodParam: 'employee-id', responseProp: 'employee_id', name: 'Employee ID'},
      {methodParam: 'db-id', responseProp: 'id', name: 'Library IAM DB ID'}
    ];
  }

  /**
   * @description Get an array of all UC PATH title codes that are primary appointment of library employees
   * @param {Boolean} skipCache - Will not use local db cache
   * @returns {Object} {res, error} - where res is an array of title code objects
   */
  async getActiveTitleCodes(skipCache=false){

    if ( !skipCache ) {
      const cacheRes = await cache.get(this.cacheKeys.titleCodes, this.cacheKeys.titleCodes, this.api.config.serverCacheExpiration);
      if ( cacheRes.res?.rows?.length ) {
        return cacheRes.res.rows[0].data;
      }
    }

    const res = await this.api.get('/active-titles');
    if ( res.error ) return res;

    if ( !skipCache ){
      await cache.set(this.cacheKeys.titleCodes, this.cacheKeys.titleCodes, res);
    }

    return res;
  };

  /**
   * @description Query the library IAM API for employee records
   * @param {Object} query - Query object with the following available properties:
   * - name: Employee name
   * - department: Array of department numbers
   * - title-code: Array of title codes
   * @param {Boolean} skipCache - Will not use local db cache
   * @returns {Object} {res, error} - where res is an array of records
   */
  async queryIam(query={}, skipCache=false){

    // ensure certain query props are arrays and then make them comma separated strings
    const arrayQueryProps = ['department', 'title-code'];
    arrayQueryProps.forEach(prop => {
      if ( query[prop] && !Array.isArray(query[prop]) ) query[prop] = [query[prop]];
      if ( query[prop] ) {
        query[prop].sort();
        query[prop] = query[prop].join(',');
      }
    });

    // Check cache
    const cacheKey = JSON.stringify(query, Object.keys(query).sort());
    if ( !skipCache ) {
      const cacheRes = await cache.get(this.cacheKeys.employeeQuery, cacheKey, this.api.config.serverCacheExpiration);
      if ( cacheRes.res?.rows?.length ) {
        return cacheRes.res.rows[0].data;
      }
    }

    // Get records from API
    const res = await this.api.get('/employees', query);
    if ( res.error ) return res;

    // Update cache
    if ( !skipCache && res.res.length ){
      await cache.set(this.cacheKeys.employeeQuery, cacheKey, res);
    }

    return res;
  }

  /**
   * @description Get library IAM employee record by id
   * @param {String|String[]} id - id or array of ids
   * @param {String} idType - id type (user-id, iam-id, email, employee-id, db-id)
   * @param {Boolean} skipCache - Will not use local db cache
   * @returns {Object} {res, error} - where res is a single record or array of records
   */
  async getIamRecordById(id, idType='user-id', skipCache=false) {
    const returnSingle = Array.isArray(id) ? false : true;
    const cacheType = `${this.cacheKeys.singleEmployee}--${idType}`;

    // create array of ids regardless of input type
    const ids = (Array.isArray(id) ? id : [id]).filter(id => id).map(id => String(id)).map(id => id.trim()).filter(id => id);
    if ( ids.length === 0 ) {
      return pg.returnError('No employee ids provided.');
    }

    // Check idType
    const idTypeObj = this.idTypes.find(type => type.methodParam === idType);
    if ( !idTypeObj ) {
      return pg.returnError('Invalid id type provided.');
    }

    // Check cache for each employee record
    const recordsById = {};
    for ( const id of ids ) {
      recordsById[id] = null;
    }
    if ( !skipCache ) {
      for (const id of ids) {
        const cacheRes = await cache.get(cacheType, id, this.api.config.serverCacheExpiration);
        if ( cacheRes.error) continue;
        if ( cacheRes.res?.rows?.length ) {
          recordsById[id] = cacheRes.res.rows[0].data;
        }
      }
    }

    // return if all records were found in cache
    const idsNotInCache = ids.filter(id => !recordsById[id]);
    if ( idsNotInCache.length === 0 ) {
      return returnSingle ? {res: recordsById[ids[0]]} : {res: ids.map(id => recordsById[id]).filter(record => record)};
    }

    // Get records from API
    const queryParams = {
      'id-type': idType,
      groups: true,
      supervisor: true,
      'department-head': true
    };
    let res = await this.api.get(`/employees/${idsNotInCache.join(',')}`, queryParams);
    if ( res.error && res.error.is404  && !returnSingle) {
      res = {res: []};
    } else if ( res.error ) {
      return res;
    }

    (Array.isArray(res.res) ? res.res : [res.res]).forEach(record => {
      const id = record[idTypeObj.responseProp];
      if ( !id ) return;
      recordsById[id] = record;
    });

    // Update cache
    if ( !skipCache ){
      for ( const id of idsNotInCache ) {
        if ( recordsById[id] ) {
          await cache.set(cacheType, id, recordsById[id]);
        }
      }
    }

    // return records
    return returnSingle ? {res: recordsById[ids[0]]} : {res: ids.map(id => recordsById[id]).filter(record => record)};
  }
}

export default new Employee();
