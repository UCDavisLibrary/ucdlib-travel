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
}

export default new ApiUtils();
