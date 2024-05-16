/**
 * @class UrlUtils
 * @description Utility class for URL manipulation
 */
class UrlUtils {

  /**
   * @description Get the sorted query string from an object
   * @param {Object} q - query object
   * @param {String} empty - return value if query object is empty - default <empty string>
   * @returns {String}
   */
  queryStringFromObject(q, empty=''){
    if ( !q || !Object.keys(q).length) return empty;

    // sort array values
    for (const k in q) {
      if ( Array.isArray(q[k]) ) q[k].sort();
    }

    // remove empty values
    for (const k in q) {
      if ( !q[k] ) delete q[k];
      if ( Array.isArray(q[k]) && !q[k].length ) delete q[k];
    }

    // join arrays
    for (const k in q) {
      if ( Array.isArray(q[k]) ) q[k] = q[k].join(',');
    }

    const searchParams = new URLSearchParams(q);
    searchParams.sort();
    return searchParams.toString();
  }

  /**
   * @description Convert a query object to kebab-case
   * @param {Object} q - query object
   * @returns {Object}
   */
  queryToKebabCase(q){
    const out = {};
    for (const k in q) {

      // covert snake_case to kebab-case
      let newK = k.replace(/_/g, '-');

      // convert camelCase to kebab-case
      newK = newK.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

      if ( newK !== k ) {
        out[newK] = q[k];
      } else {
        out[k] = q[k];
      }

    }
    return out;
  }

  /**
   * @description Convert a query object to camelCase
   * @param {Object} q - query object
   * @returns {Object}
   */
  queryToCamelCase(q){
    const out = {};
    for (const k in q) {

      // convert snake_case to camelCase
      let newK = k.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

      // convert kebab-case to camelCase
      newK = newK.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

      if ( newK !== k ) {
        out[newK] = q[k];
      } else {
        out[k] = q[k];
      }

    }
    return out;
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
