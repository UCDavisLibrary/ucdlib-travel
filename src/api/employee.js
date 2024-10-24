import employee from "../lib/db-models/employee.js";
import protect from "../lib/protect.js";
import apiUtils from "../lib/utils/apiUtils.js";

/**
 * @param {Router} api - Express router instance
 */
export default (api) => {

  /**
   * @description Query the library IAM API for employee records
   */
  api.get('/employee', protect('hasBasicAccess'), async (req, res) => {
    const PAGE_SIZE = 20;

    // query params
    const name = req.query.name;
    const department = (req.query.department || '').split(',');
    const titleCode = (req.query['title-code'] || '').split(',');
    const page = apiUtils.getPageNumber(req);

    // construct iam query object
    const query = {};
    if ( name ) query.name = name;
    if ( department.length ) query.department = department;
    if ( titleCode.length ) query['title-code'] = titleCode;

    const apiResult = await employee.queryIam(query);

    if ( apiResult.error ) {
      console.error(apiResult.error);
      return res.status(500).json({error: true, message: 'Error querying employee data.'});
    }

    // pagination
    const total = apiResult.res.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const data = apiResult.res.slice(start, end);

    res.json({
      total,
      totalPages,
      page,
      data
    });

  });

  /**
   * @description Get a single library IAM employee record or array of records by id
   */
  api.get('/employee/:id', protect('hasBasicAccess'), async (req, res) => {
    const maxIds = 20;
    const id = req.params.id || '';

    const ids = id.split(',');
    if ( ids.length > maxIds ) {
      return res.status(400).json({error: true, message: `Too many IDs. Maximum is ${maxIds}.`});
    }

    const idType = req.query['id-type'] || 'user-id';
    const apiResult = await employee.getIamRecordById(ids.length > 1 ? ids : ids[0], idType);

    if ( apiResult.error ) {
      if ( apiResult.error.is404 ) {
        return res.status(404).json({error: true, message: 'Employee record not found.'});
      }
      console.error(apiResult.error);
      return res.status(500).json({error: true, message: 'Error querying employee data.'});
    }

    res.json(apiResult.res);
  });

  /**
   * @description Get a list of active title codes
   */
  api.get('/active-titles', protect('hasBasicAccess'), async (req, res) => {
    const apiResult = await employee.getActiveTitleCodes();

    if ( apiResult.error ) {
      console.error(apiResult.error);
      return res.status(500).json({error: true, message: 'Error querying active titles.'});
    }

    res.json(apiResult.res);

  });

}
