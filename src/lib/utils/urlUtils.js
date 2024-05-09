/**
 * @class UrlUtils
 * @description Utility class for URL manipulation
 */
class UrlUtils {

  /**
   * @description Get the query string from an object
   * @param {Object} q - query object
   * @param {String} empty - return value if query object is empty - default <empty string>
   * @returns {String}
   */
  queryStringFromObject(q, empty=''){
    if ( !q || !Object.keys(q).length) return empty;
    const searchParams = new URLSearchParams(q);
    searchParams.sort();
    return searchParams.toString();
  }

  /**
   * @description Sort and comma join an array or single value
   * @param {Array|String} v - value to sort and join
   * @returns {String} - comma separated string
   */
  sortAndJoin(v){
    v = v || [];
    if( !Array.isArray(v) ) v = [v];
    v.sort();
    return v.join(',');
  }

  /**
   * @description Strip keys from a hash
   * @param {Array} keys - keys to strip from hash
   * @param {String} hash - hash - default window.location.hash
   * @returns {String}
   */
  stripFromHash(keys=[], hash){
    hash = hash || window.location.hash;
    hash = hash.replace(/^#/,'');
    if ( !hash ) return '';
    const searchParams = new URLSearchParams(hash);
    keys.forEach(k => searchParams.delete(k));
    return searchParams.toString();
  }
}

export default new UrlUtils();
