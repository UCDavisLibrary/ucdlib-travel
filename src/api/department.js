import department from "../lib/db-models/department.js";
import protect from "../lib/protect.js";
import log from "../lib/utils/log.js";

/**
 * @param {Router} api - Express router instance
 */
export default (api) => {

  /**
   * @description Get an array of all active library departments from the library IAM API
   */
  api.get('/active-departments', protect('hasBasicAccess'), async (req, res) => {
    const result = await department.getActiveDepartments();

    if ( result.error ) {
      console.error(result.error);
      return res.status(500).json({error: true, message: 'Error querying department data.'});
    }

    res.json(result.res);
  });

  /**
   * @description Get an array of all library departments from the local database
   */
  api.get('/department', protect('hasBasicAccess'), async (req, res) => {
    const result = await department.get();
    if (result.error) {
      log.error('Error querying department data.', result.error);
      return res.status(500).json({error: true, message: 'Error querying department data.'});
    }
    return res.json(result);
  });
};
