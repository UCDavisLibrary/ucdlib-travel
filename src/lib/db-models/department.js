import cache from "./cache.js";
import libraryIamApi from "../utils/LibraryIamApi.js";

/**
 * @class Department
 * @description Class for querying data about library departments
 */
class Department {

  constructor(){

    this.api = libraryIamApi;

    // DB cache keys
    this.cacheKeys = {
      activeDepartments: 'ucdlib-iam-active-departments',
      childDepartments: 'ucdlib-iam-child-departments'
    };
  }

  /**
   * @description Get an array of all active library departments from the library IAM API
   * @param {Boolean} skipCache - Will not use local db cache
   * @returns {Object} {res, error} - where res is an array of group objects
   */
  async getActiveDepartments(skipCache=false){
    if ( !skipCache ) {
      const cacheRes = await cache.get(this.cacheKeys.activeDepartments, this.cacheKeys.activeDepartments, this.api.config.serverCacheExpiration);
      if ( cacheRes.res?.rows?.length ) {
        return cacheRes.res.rows[0].data;
      }
    }

    const res = await this.api.get('/groups', {'filter-active': true, 'filter-part-of-org': true, head: true});
    if ( res.error ) return res;

    if ( !skipCache ){
      await cache.set(this.cacheKeys.activeDepartments, this.cacheKeys.activeDepartments, res);
    }

    return res;
  }

  /**
   * @description Recursively get an array of all descendant departments of a department
   * @param {Number} departmentId - The id of the department
   * @param {Boolean} skipCache - Will not use local db cache
   * @param {Array} descendantDepartments - Array of simplified department objects
   * @returns {Array|Object} - Array of simplified department objects or an error object
   */
  async getAllDescendantDepartments(departmentId, skipCache, descendantDepartments=[]){

    let department;

    if ( !skipCache ) {
      const cacheRes = await cache.get(this.cacheKeys.childDepartments, departmentId, this.api.config.serverCacheExpiration);
      if ( cacheRes.res?.rows?.length ) {
        department = cacheRes.res.rows[0].data;
      }
    }

    if ( !department ) {
      const args = {'filter-id': departmentId, children: true };
      department = await this.api.get(`/groups`, args);

      if ( department.error ) {
        return department;
      }
      if ( !department.res?.length ) {
        return {error: true, message: 'No department found'};
      }
      if ( !skipCache ) {
        await cache.set(this.cacheKeys.childDepartments, departmentId, department);
      }
    }

    department = department.res[0];

    // Recursively get all descendant departments
    if ( Array.isArray(department.children) ){
      descendantDepartments = descendantDepartments.concat(department.children);
      for ( const child of department.children ){
        const r = await this.getAllDescendantDepartments(child.id, skipCache, descendantDepartments);
        if ( r.error ) {
          console.error('Error getting child departments', r.error);
          return r;
        }
      }
    }

    return descendantDepartments;
  }


}

export default new Department();
