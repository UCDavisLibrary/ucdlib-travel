import department from "../lib/db-models/department.js";
import protect from "../lib/protect.js";

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
};
