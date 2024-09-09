import protect from "../lib/protect.js";
import settings from "../lib/db-models/settings.js";
import reports from "../lib/db-models/reports.js";
import apiUtils from "../lib/utils/apiUtils.js"
import reportUtils from "../lib/utils/reports/reportUtils.js";

const basePath = '/reports';

export default (api) => {

  api.get(basePath, protect('hasBasicAccess'), async (req, res) => {
    const accessLevel = await reports.getAccessLevel(req.auth.token);
    if ( accessLevel.error ){
      console.error('Error fetching access level', accessLevel);
      return res.status(500).json({error: true, message: 'Error fetching access level'});
    }

    const metrics = reportUtils.getMetricsFromValues(apiUtils.explode(req.query.metrics), true);
    if ( !metrics.length ){
      return res.status(400).json({error: true, message: 'No valid metrics provided. At least one metric is required'});
    }

    const aggregators = {
      x: reportUtils.aggregators.find(a => a.urlParam === req.query['aggregator-x']),
      y: reportUtils.aggregators.find(a => a.urlParam === req.query['aggregator-y'])
    };
    if ( !aggregators.x && !aggregators.y ){
      return res.status(400).json({error: true, message: 'No valid aggregators provided. At least one aggregator is required'});
    }
    if ( aggregators.x && aggregators.y && metrics.length > 1 ){
      return res.status(400).json({error: true, message: 'Multiple metrics are not allowed when both x and y aggregators are provided'});
    }

    const filters = {};
    reportUtils.filters.forEach(filter => {
      filters[filter.value] = apiUtils.explode(req.query[filter.urlParam]);
    });

    if ( accessLevel.departmentRestrictions.length ){
      if ( filters.department?.length ){
        if ( !filters.department.every(department => accessLevel.departmentRestrictions.includes(department)) ){
          return apiUtils.do403(res);
        }
      } else {
        filters.department = accessLevel.departmentRestrictions;
      }
    }

    const kwargs = {metrics, aggregators, filters};
    const data = await reports.get(kwargs);
    if ( data.error ){
      console.error('Error fetching report', data);
      return res.status(500).json({error: true, message: 'Error fetching report'});
    }
    return res.json(data);
  });

  api.get(`${basePath}/access-level`, protect('hasBasicAccess'), async (req, res) => {
    const out = {
      helpUrl: await settings.getValue('auth_request_url', '')
    };

    const accessLevel = await reports.getAccessLevel(req.auth.token);
    if ( accessLevel.error ){
      console.error('Error fetching access level', accessLevel);
      return res.status(500).json({error: true, message: 'Error fetching access level'});
    }
    out.hasAccess = accessLevel.hasAccess;
    out.departmentRestrictions = accessLevel.departmentRestrictions;

    return res.json(out);
  });

  api.get(`${basePath}/filters`, protect('hasBasicAccess'), async (req, res) => {

    // authorization
    const accessLevel = await reports.getAccessLevel(req.auth.token);
    if ( accessLevel.error ){
      console.error('Error fetching access level', accessLevel);
      return res.status(500).json({error: true, message: 'Error fetching access level'});
    }
    if ( !accessLevel.hasAccess ){
      return apiUtils.do403(res);
    }

    const filters = [];
    const departmentRestrictions = accessLevel.departmentRestrictions;

    // fiscal years
    const fiscalYears = await reports.getFiscalYearCount(departmentRestrictions, true);
    if ( fiscalYears.error ){
      console.error('Error fetching fiscal year count', fiscalYears);
      return res.status(500).json({error: true, message: 'Error fetching fiscal year count'});
    }
    const fiscalYearOptions = fiscalYears.map(fy => {
      return {
        value: fy.fiscalYear.startYear,
        label: fy.fiscalYear.labelShort,
        count: fy.count
      }
    });
    filters.push({
      type: 'fiscalYear',
      label: 'Fiscal Year',
      isNumber: true,
      options: fiscalYearOptions
    });

    // departments
    const departments = await reports.getDepartmentCount(departmentRestrictions);
    const activeDepartmentOptions = [];
    const archivedDepartmentOptions = [];
    departments.forEach(department => {
      const option = {
        value: department.departmentId,
        label: department.label,
        count: Number(department.count)
      };
      if ( department.archived ){
        archivedDepartmentOptions.push(option);
      } else {
        activeDepartmentOptions.push(option);
      }
    });
    const departmentHasOptionGroups = activeDepartmentOptions.length && archivedDepartmentOptions.length;
    let departmentOptions = activeDepartmentOptions;
    if ( departmentHasOptionGroups ){
      departmentOptions = [
        {
          label: 'Active',
          options: activeDepartmentOptions
        },
        {
          label: 'Archived',
          options: archivedDepartmentOptions
        }
      ]
    }
    filters.push({
      type: 'department',
      label: 'Department',
      isNumber: true,
      hasOptionGroups: departmentHasOptionGroups,
      options: departmentOptions
    });

    // employees
    const employees = await reports.getEmployeeCount(departmentRestrictions);
    const activeEmployeeOptions = [];
    const archivedEmployeeOptions = [];
    employees.forEach(employee => {
      const option = {
        value: employee.kerberos,
        label: `${employee.firstName} ${employee.lastName}`,
        count: Number(employee.count)
      };
      if ( employee.archived ){
        archivedEmployeeOptions.push(option);
      } else {
        activeEmployeeOptions.push(option);
      }
    });
    const employeeHasOptionGroups = activeEmployeeOptions.length && archivedEmployeeOptions.length;
    let employeeOptions = activeEmployeeOptions;
    if ( employeeHasOptionGroups ){
      employeeOptions = [
        {
          label: 'Active',
          options: activeEmployeeOptions
        },
        {
          label: 'Archived',
          options: archivedEmployeeOptions
        }
      ]
    }
    filters.push({
      type: 'employee',
      label: 'Employee',
      hasOptionGroups: employeeHasOptionGroups,
      options: employeeOptions
    });

    // funding sources
    const fundingSources = await reports.getFundingSourceCount(departmentRestrictions);
    const activeFundingSourceOptions = [];
    const archivedFundingSourceOptions = [];
    fundingSources.forEach(fs => {
      const option = {
        value: fs.fundingSourceId,
        label: fs.label,
        count: Number(fs.count)
      };
      if ( fs.archived ){
        archivedFundingSourceOptions.push(option);
      } else {
        activeFundingSourceOptions.push(option);
      }
    });
    const fundingSourceHasOptionGroups = activeFundingSourceOptions.length && archivedFundingSourceOptions.length;
    let fundingSourceOptions = activeFundingSourceOptions;
    if ( fundingSourceHasOptionGroups ){
      fundingSourceOptions = [
        {
          label: 'Active',
          options: activeFundingSourceOptions
        },
        {
          label: 'Archived',
          options: archivedFundingSourceOptions
        }
      ]
    }
    filters.push({
      type: 'fundingSource',
      label: 'Funding Source',
      hasOptionGroups: fundingSourceHasOptionGroups,
      isNumber: true,
      options: fundingSourceOptions
    });

    return res.json(filters);

  });
};
