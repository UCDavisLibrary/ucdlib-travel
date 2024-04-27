class ApiUtils {

  /**
   * @description Get the page number from the query string
   * @param {*} req - Express request object
   * @returns {Number}
   */
  getPageNumber(req){
    const page = parseInt(req.query.page);
    return isNaN(page) ? 1 : page;
  }

  /**
   * @description Check if value is an array of objects
   */
  isArrayOfObjects(arr){
    if ( !Array.isArray(arr) ) return false;
    return arr.every(item => typeof item === 'object');
  }
}

export default new ApiUtils();
