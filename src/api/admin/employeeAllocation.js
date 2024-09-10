import employeeAllocation from "../../lib/db-models/employeeAllocation.js";
import approvalRequest from "../../lib/db-models/approvalRequest.js";
import reimbursementRequest from "../../lib/db-models/reimbursementRequest.js";
import apiUtils from "../../lib/utils/apiUtils.js";
import urlUtils from "../../lib/utils/urlUtils.js";
import protect from "../../lib/protect.js";
import fiscalYearUtils from "../../lib/utils/fiscalYearUtils.js";
import typeTransform from "../../lib/utils/typeTransform.js";

export default (api) => {

  /**
   * @description Create new employee allocations
   */
  api.post('/employee-allocation', protect('hasAdminAccess'), async (req, res) => {
    const allowDuplicateAllocations = req.query['allow-duplicate-allocations'] ? true : false;
    const payload = (typeof req.body === 'object') && !Array.isArray(req.body) ? req.body : {};
    const data = await employeeAllocation.create(payload, req.auth.token.employeeObject, allowDuplicateAllocations);
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
   * @description Get a summary of employee allocations for a user by fiscal year
   * @param {String} req.query.fiscalYears - comma-separated list of fiscal years. at least one is required.
   * @param {Number} req.query.approvalRequestId - optional approval request id to include in the summary. Must not be in 'approved' state.
   * @returns {Object} - A summary of the user's allocations by fiscal year
   */
  api.get('/employee-allocation/user-summary', protect('hasBasicAccess'), async (req, res) => {
    let employeeKerberos = req.auth.token.id;
    let forAnotherUser = false;

    const reqQuery = urlUtils.queryToCamelCase(req.query);

    const fiscalYears = apiUtils.explode(reqQuery.fiscalYears, true)
      .map(year => fiscalYearUtils.fromStartYear(year, true))
      .filter(fy => fy !== null);

    if ( !fiscalYears.length ){
      return res.status(400).json({error: true, message: 'At leat one valid fiscal year is required'});
    }
    const startYears = fiscalYears.map(fy => fy.startYear);

    // get approval request data if an approval request id is provided
    let approvalRequestFundingSources = [];
    let approvalRequestFiscalYear;
    const approvalRequestId = typeTransform.toPositiveInt(reqQuery.approvalRequestId);
    if ( approvalRequestId ) {
      let ap = await approvalRequest.get({isCurrent: true, requestIds: [approvalRequestId]});
      if ( ap.error ) {
        console.error('Error in GET /employee-allocation/user-summary', ap.error);
        return res.status(500).json({error: true, message: 'Error getting user allocation summary.'});
      }
      if ( !ap.total ){
        return res.status(400).json({error: true, message: 'Invalid approval request id'});
      }
      ap = ap.data[0];
      if ( ap.employeeKerberos !== req.auth.token.id ) {
        employeeKerberos = ap.employeeKerberos;
        forAnotherUser = true;
      }

      if ( forAnotherUser && !(req.auth.token.hasAdminAccess || ap.approvalStatusActivity.some(a => a.employeeKerberos === req.auth.token.id))){
        return apiUtils.do403(res);
      }

      if ( ap.approvalStatus === 'approved' ) {
        return res.status(400).json({error: true, message: 'Approval request has already been approved, so it will be double-counted in the user summary'});
      }

      approvalRequestFundingSources = ap.fundingSources;
      approvalRequestFiscalYear = fiscalYearUtils.fromDate(ap.programStartDate).startYear;

    }

    const fundTotals = await employeeAllocation.getTotalByFundFy({fiscalYears: startYears});
    if ( fundTotals.error ) {
      console.error('Error in GET /employee-allocation/user-summary', fundTotals.error);
      return res.status(500).json({error: true, message: 'Error getting user allocation summary.'});
    }
    const userTotals = await employeeAllocation.getTotalByFundFy({fiscalYears: startYears, employees: [employeeKerberos]});
    if ( userTotals.error ) {
      console.error('Error in GET /employee-allocation/user-summary', userTotals.error);
      return res.status(500).json({error: true, message: 'Error getting user allocation summary.'});
    }

    const out = {};
    for (const fy of fiscalYears) {
      const data = {fiscalYear: fy.startYear, funds: []};

      // get approved total (projected - what has not already been reimbursed) for the user
      let args = {employees: [employeeKerberos], fiscalYear: fy.startYear, excludeReimbursed: true, approvalStatus: 'approved'};
      const approvedTotal = await approvalRequest.getTotalFundingSourceExpendituresByEmployee(args);
      if ( approvedTotal.error ) {
        console.error('Error in GET /employee-allocation/user-summary', approvedTotal.error);
        return res.status(500).json({error: true, message: 'Error getting user allocation summary.'});
      }

      // get reimbursed total for the user
      args = {
        employees: [employeeKerberos],
        fiscalYear: fy.startYear,
        approvalRequestReimbursementStatus: 'fully-reimbursed',
        reimbursementRequestStatus: 'fully-reimbursed'
      };
      const reimbursedTotal = await reimbursementRequest.getTotalFundingSourceExpendituresByEmployee(args);
      if ( reimbursedTotal.error ) {
        console.error('Error in GET /employee-allocation/user-summary', reimbursedTotal.error);
        return res.status(500).json({error: true, message: 'Error getting user allocation summary.'});
      }

      fundTotals.filter(fundTotal => fundTotal.fiscalYear == fy.startYear).forEach( fundTotal => {

        const employeeAllocation = userTotals.find(ut => ut.fundingSourceId === fundTotal.fundingSourceId && ut.fiscalYear == fy.startYear)?.totalAllocation || 0;
        const employeeProjected = approvedTotal.find(at => at.fundingSourceId === fundTotal.fundingSourceId)?.totalExpenditures || 0;
        const employeeReimbursed = reimbursedTotal.find(rt => rt.fundingSourceId === fundTotal.fundingSourceId)?.totalExpenditures || 0;

        let approvalRequestTotal = 0;
        if ( approvalRequestFiscalYear === fy.startYear ) {
          approvalRequestTotal = approvalRequestFundingSources.filter(fs => fs.fundingSourceId === fundTotal.fundingSourceId).reduce((acc, fs) => acc + fs.amount, 0);
        }

        const employeeRemaining = employeeAllocation - (employeeProjected + employeeReimbursed + approvalRequestTotal);
        const employeeRemainingIsNegative = employeeRemaining < 0;
        const employeeRemainingAbs = Math.abs(employeeRemaining);

        data.funds.push({
          fundingSourceId: fundTotal.fundingSourceId,
          label: fundTotal.fundingSourceLabel,
          totalAllocation: fundTotal.totalAllocation,
          employeeAllocation,
          employeeProjected,
          employeeReimbursed,
          employeeRemaining,
          employeeRemainingAbs,
          employeeRemainingIsNegative,
          approvalRequestTotal
        });
      });

      out[fy.startYear] = data;

    }

    return res.json(out);
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
