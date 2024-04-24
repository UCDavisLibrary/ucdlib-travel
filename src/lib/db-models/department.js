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
      activeDepartments: 'ucdlib-iam-active-departments'
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


}

export default new Department();
