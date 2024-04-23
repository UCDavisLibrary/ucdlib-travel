import employee from "../lib/db-models/employee.js";
import protect from "../lib/protect.js";

/**
 * @param {Router} api - Express router instance
 */
export default (api) => {

  api.get('/employee', protect('hasBasicAccess'), async (req, res) => {


    res.json({test: await employee.queryIam({department: [19,22]})});

  });

}
