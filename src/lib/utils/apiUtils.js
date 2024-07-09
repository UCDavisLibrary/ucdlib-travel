import typeTransform from "./typeTransform.js";

/**
 * @description Utility functions for common API tasks - mostly request parsing stuff
 */
class ApiUtils {

  /**
   * @description Get the page number from the query string
   * @param {*} req - Express request object
   * @returns {Number}
   */
  getPageNumber(req){
    let page = parseInt(req.query.page);
    if ( isNaN(page) || page < 1 ) return 1;
    return page;
  }

  /**
   * @description Get the page size from the query string
   * @param {*} req - Express request object
   * @returns {Number}
   */
  getPageSize(req){
    let pageSize = req.query['page-size'];
    if ( pageSize == '-1' ) return -1;
    pageSize = typeTransform.toPositiveInt(pageSize);
    if ( !pageSize ) return 10;
    return pageSize;
  }

  /**
   * @description Check if value is an array of objects
   */
  isArrayOfObjects(arr){
    if ( !Array.isArray(arr) ) return false;
    return arr.every(item => typeof item === 'object');
  }

  /**
   * @description Split a string into an array of values and optionally convert to integers
   * @param {String} value - the value to split
   * @param {Boolean} asInt - if true, convert to integers
   * @returns {Array}
   */
  explode(value, asInt=false){
    let out = [];
    if ( !value ) return out;
    if ( Array.isArray(value) ) {
      out = value.map(item => typeof item === 'string' ? item.trim() : item);
    } else if ( typeof value === 'string' ) {
      out = value.split(',').map(item => item.trim());
    } else {
      return out;
    }
    if ( !asInt ) return out;
    return out.map(item => parseInt(item)).filter(item => !isNaN(item));
  }

  /**
   * @description Return a 403 response
   */
  do403(res){
    return res.status(403).json({error: true, message: 'Not authorized to access this resource.'});
  }
}

export default new ApiUtils();
