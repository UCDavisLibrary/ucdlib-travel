import employeeAllocation from "../../lib/db-models/employeeAllocation.js";
import protect from "../../lib/protect.js";

export default (api) => {

  api.post('/employee-allocation', protect('hasAdminAccess'), async (req, res) => {
    const payload = (typeof req.body === 'object') && !Array.isArray(req.body) ? req.body : {};
    const data = await employeeAllocation.create(payload, req.auth.token.employeeObject);
    if ( data.error && data.is400 ) {
      return res.status(400).json(data);
    }
    if ( data.error ) {
      console.error('Error in POST /employee-allocation', data.error);
      return res.status(500).json({error: true, message: 'Error creating employee allocation.'});
    }
    return res.json(data);
  });
};
