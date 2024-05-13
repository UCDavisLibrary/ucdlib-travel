import employeeAllocation from "../../lib/db-models/employeeAllocation.js";
import protect from "../../lib/protect.js";

export default (api) => {

  /**
   * @description Create new employee allocations
   */
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

  /**
   * @description Get options for filtering employee allocations
   */
  api.get('/employee-allocation/filters', protect('hasAdminAccess'), async (req, res) => {
    const data = await employeeAllocation.getTotalByUser();
    if ( data.error ) {
      console.error('Error in GET /employee-allocation/filters', data.error);
      return res.status(500).json({error: true, message: 'Error getting employee allocation filters.'});
    }
    const out = {
      employees: [],
      fundingSources: []
    }
    for (const employee of data) {
      out.employees.push({kerberos: employee.kerberos, firstName: employee.firstName, lastName: employee.lastName});
      for (const fundingSource of employee.fundingSources) {
        if ( !out.fundingSources.find(fs => fs.fundingSourceId === fundingSource.fundingSourceId) ) {
          out.fundingSources.push({fundingSourceId: fundingSource.fundingSourceId, label: fundingSource.label});
        }
      }
    }
    out.employees.sort((a, b) => a.lastName.localeCompare(b.lastName));
    return res.json(out);
  });
};
