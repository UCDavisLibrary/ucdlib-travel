import employeeAllocation from "../../lib/db-models/employeeAllocation.js";
import apiUtils from "../../lib/utils/apiUtils.js";
import protect from "../../lib/protect.js";
import fiscalYearUtils from "../../lib/utils/fiscalYearUtils.js";

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
   * @description Delete employee allocations - does not actually delete records, just marks them as deleted
   * @param {String} req.body.ids - comma-separated list of allocation ids to delete
   */
  api.delete('/employee-allocation', protect('hasAdminAccess'), async (req, res) => {
    const ids = apiUtils.explode(req.body.ids, true);
    const data = await employeeAllocation.archive(ids, req.auth.token.employeeObject);
    if ( data.error ) {
      console.error('Error in DELETE /employee-allocation', data.error);
      return res.status(500).json({error: true, message: 'Error deleting employee allocations.'});
    }
    return res.json(data);
  });

  /**
   * @description Get a list of employee allocations
   * @param {String} req.query.employees - comma-separated list of kerberos ids or 'self' to get current user's records
   * @param {String} req.query.funding-sources - comma-separated list of funding source ids
   * @param {String} req.query.fiscal-years - comma-separated list of fiscal years
   * @param {Number} req.query.page - page number for pagination
   */
  api.get('/employee-allocation', protect('hasBasicAccess'), async (req, res) => {
    const fetchingOwnRecords = req.query.employees === 'self';
    if ( !fetchingOwnRecords && !req.auth.token.hasAdminAccess ) {
      return apiUtils.do403(res);
    }
    const kwargs = {};
    kwargs.employees = fetchingOwnRecords ? [req.auth.token.employeeObject.kerberos] : apiUtils.explode(req.query.employees);
    kwargs.fundingSources = apiUtils.explode(req.query['funding-sources'], true);
    kwargs.page = apiUtils.getPageNumber(req);

    const startDates =
      apiUtils.explode(req.query['fiscal-years'], true)
      .map(year => fiscalYearUtils.fromStartYear(year, true))
      .filter(fy => fy !== null)
      .map(fy => fy.startDate({isoDate: true}));

    if ( startDates.length > 0 ) {
      kwargs.startDate = startDates;
    }

    const data = await employeeAllocation.get(kwargs);
    if ( data.error ) {
      console.error('Error in GET /employee-allocation', data.error);
      return res.status(500).json({error: true, message: 'Error getting employee allocations.'});
    }
    return res.json(data);
  });

  /**
   * @description Get options for filtering employee allocations
   */
  api.get('/employee-allocation/filters', protect('hasAdminAccess'), async (req, res) => {
    const out = {
      employees: [],
      fundingSources: [],
      fiscalYears: []
    };

    // employee and funding source filters
    let data = await employeeAllocation.getTotalByUser();
    if ( data.error ) {
      console.error('Error in GET /employee-allocation/filters', data.error);
      return res.status(500).json({error: true, message: 'Error getting employee allocation filters.'});
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

    // fiscal year filters
    data = await employeeAllocation.getTotalByStartDate();
    if ( data.error ) {
      console.error('Error in GET /employee-allocation/filters', data.error);
      return res.status(500).json({error: true, message: 'Error getting employee allocation filters.'});
    }
    for (const fy of data) {
      out.fiscalYears.push(fiscalYearUtils.fromDate(fy.startDate).startYear);
    }

    return res.json(out);
  });
};
