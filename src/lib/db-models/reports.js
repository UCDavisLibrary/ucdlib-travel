import pg from "./pg.js";
import employeeModel from './employee.js';
import departmentModel from './department.js';
import fundingSourceModel from "./fundingSource.js";
import IamEmployeeObjectAccessor from "../utils/iamEmployeeObjectAccessor.js";
import fiscalYearUtils from "../utils/fiscalYearUtils.js";
import EntityFields from "../utils/EntityFields.js";
import ReportSqlUtils from "../utils/reports/ReportSqlUtils.js";

class Reports {

  constructor(){}

  /**
   * @description Get the totals for the given metrics, aggregators, and filters in a combined tabular format
   * @param {Object} kwargs - An object with the following properties:
   * - metrics: Array - An array of Metric class objects
   * - aggregators: Object - An object with the x and y properties that are Aggregator class objects
   * - filters: Object - An object with the filter names as the keys and the filter values as the values
   * @returns {Array} - If successful, an array of arrays of objects with the following properties:
   * - value: The value of the cell
   * - label: The label of the cell
   * - isTotal: Boolean - Whether the cell is a total cell
   * - isHeader: Boolean - Whether the cell is a header cell
   * - isMonetary: Boolean - Whether the cell value is a monetary value
   */
  async get(kwargs={}){
    const {metrics, aggregators, filters} = kwargs;


    // Get all reports required by the metrics for this request
    const reportsRequired = [];
    for ( const metric of metrics ){
      for ( const report of metric.reportsRequired ){
        if ( !reportsRequired.find(r => r.report === report) ){
          const funcName = `get${report[0].toUpperCase()}${report.slice(1)}`;
          if ( typeof this[funcName] !== 'function' ){
            return {error: true, message: `Invalid report type: ${report}`};
          }
          reportsRequired.push({report, fn: this[funcName]});
        }
      }
    }
    const reportPromises = await Promise.allSettled(reportsRequired.map(({fn}) => fn({aggregators, filters})));
    for ( const [i, promise] of reportPromises.entries() ){
      if ( promise.status === 'rejected' || promise.value.error ){
        return {error: true, message: `Error fetching report: ${reportsRequired[i].report}`, details: promise};
      }
      reportsRequired[i].data = promise.value;
    }

    // Combine the data from the reports according to the aggregators
    const combinedData = [];
    for ( const report of reportsRequired ){
      const reportSlug  = report.report;
      for ( const row of report.data ){
        const agX = aggregators.x ? row[aggregators.x.reportColumn] : null;
        const agY = aggregators.y ? row[aggregators.y.reportColumn] : null;
        const existing = combinedData.find(r => r.aggregatorX === agX && r.aggregatorY === agY);
        if ( existing ) {
          existing.reportValues[reportSlug] = row[ReportSqlUtils.measureColumn];
        } else {
          const newRow = {
            aggregatorX: agX,
            aggregatorY: agY,
            reportValues: {
              [reportSlug]: row[ReportSqlUtils.measureColumn]
            }
          }
          combinedData.push(newRow);
        }
      }
    }

    // compute metrics based on the report values
    for ( const row of combinedData ){
      row.metricValues = {};
      for ( const metric of metrics ){
        const reportValues = metric.reportsRequired.map(r => row.reportValues[r] || 0);
        row.metricValues[metric.value] = metric.doReportsCalculation(...reportValues);
      }
    }

    // Get the x/y axis headers for the data
    const headers = {};
    const metricHeaders = metrics.map(m => { return {value: m.value, label: m.shortLabel, metricIsMonetary: m.isMonetary}});
    if ( aggregators.x ){
      headers.x = await this.getAggregatorLabels(aggregators.x, combinedData.map(r => r.aggregatorX));
      if ( headers.x.error ) {
        return headers.x;
      }
    } else {
      headers.x = metricHeaders;
    }
    if ( aggregators.y ){
      headers.y = await this.getAggregatorLabels(aggregators.y, combinedData.map(r => r.aggregatorY));
      if ( headers.y.error ) {
        return headers.y;
      }
    } else {
      headers.y = metricHeaders;
    }

    // Based on order of aggregators, create the data rows
    const bodyRows = [];
    for ( const headerY of headers.y ){
      const row = [];
      for ( const headerX of headers.x ){
        let value = 0;
        if ( aggregators.x && aggregators.y ){
          const existing = combinedData.find(r => r.aggregatorX === headerX.value && r.aggregatorY === headerY.value);
          if ( existing ) {
            value = existing.metricValues[metrics[0].value];
          }
        } else if ( aggregators.x ) {
          const existing = combinedData.find(r => r.aggregatorX === headerX.value);
          if ( existing ) {
            value = existing.metricValues[headerY.value];
          }
        } else if ( aggregators.y ) {
          const existing = combinedData.find(r => r.aggregatorY === headerY.value);
          if ( existing ) {
            value = existing.metricValues[headerX.value];
          }
        }
        row.push(value);
      }
      bodyRows.push(row);
    }

    // create total column if applicable
    if ( aggregators.x ){
      for ( const row of bodyRows ){
        row.push(row.reduce((a, b) => a + b, 0));
      }
      headers.x.push({value: 'total', label: 'Total'});
    }

    // create total row if applicable
    if ( aggregators.y ){
      const totalRow = [];
      for ( let i = 0; i < headers.x.length; i++ ){
        totalRow.push(bodyRows.reduce((a, b) => a + b[i], 0));
      }
      bodyRows.push(totalRow);
      headers.y.push({value: 'total', label: 'Total'});
    }

    // combine headers and body rows into final format
    const isMonetary = aggregators.x && aggregators.y ? metrics[0].isMonetary : false;
    const combinedDataRows = [];
    for ( const [rowIndex, row] of bodyRows.entries() ){
      const newRow = [];
      newRow.push({
        value: headers.y[rowIndex].value,
        label: headers.y[rowIndex].label,
        isTotal: headers.y[rowIndex].value === 'total',
        isHeader: true
      });
      for ( const [i, value] of row.entries() ){
        newRow.push({
          value,
          label: value,
          isTotal: headers.x[i].value === 'total' || headers.y[rowIndex].value === 'total',
          isMonetary: isMonetary || headers.x[i].metricIsMonetary || headers.y[rowIndex].metricIsMonetary,
          isHeader: false
        });
      }
      combinedDataRows.push(newRow);
    }
    combinedDataRows.unshift([
      {value: '', label: '', isTotal: false, isHeader: true},
      ...headers.x.map(h => {
        return {
          value: h.value,
          label: h.label,
          isTotal: h.value === 'total',
          isHeader: true
        }
      })
    ]);

    return combinedDataRows;
  }

  async getAggregatorLabels(aggregator, values=[]){
    let out = [];
    values = [...new Set( values.filter(v => v !== null) )];
    if ( aggregator?.value === 'fiscalYear' ) {
      out = values.map(v => {
        return {
          value: v,
          label: fiscalYearUtils.fromStartYear(v, true)?.label || v
        }
      });
      out.sort((a, b) => a.value - b.value);
    } else if ( aggregator?.value === 'department' ) {
      const departments = await departmentModel.get({departmentId: values});
      if ( departments.error ) {
        return departments;
      }
      out = departments.map(d => {
        return {
          value: d.departmentId,
          label: d.label
        }
      });
    } else if ( aggregator?.value === 'employee' ) {
      const query = {};
      if ( values?.length < 100 ){
        query.kerberos = values;
      }
      const employees = await employeeModel.get(query);
      if ( employees.error ) {
        return employees;
      }
      out = employees.map(e => {
        return {
          value: e.kerberos,
          label: `${e.firstName} ${e.lastName}`
        }
      });
    } else if ( aggregator?.value === 'fundingSource' ) {
      const fundingSources = await fundingSourceModel.get();
      if ( fundingSources.error ) {
        return fundingSources;
      }
      out = fundingSources.map(fs => {
        return {
          value: fs.fundingSourceId,
          label: fs.label
        }
      });
    }

    out = out.filter(o => values.includes(o.value));
    return out;
  }

  /**
   * @description Get the total requested amount from approval requests
   * @param {Object} kwargs - See get method for details
   * @returns {Array} - An array of objects with the requested amount and the aggregators
   */
  async getRequested(kwargs={}){
    const {aggregators, filters} = kwargs;

    const sqlUtils = new ReportSqlUtils({
      department: 'ar.department_id',
      employee: 'ar.employee_kerberos',
      fundingSource: 'arfs.funding_source_id',
      fiscalYear: 'ar.fiscal_year'
    });
    const whereClause = sqlUtils.parseFilters(filters, {'ar.is_current': true, 'ar.approval_status': 'approved'});
    const groupBy = sqlUtils.parseAggregators(aggregators);
    const sql = `
      SELECT
        SUM(arfs.amount) as ${sqlUtils.measureColumn}
        ${groupBy.select ? `, ${groupBy.select}` : ''}
      FROM
        approval_request ar
      JOIN
        approval_request_funding_source arfs ON arfs.approval_request_revision_id = ar.approval_request_revision_id
      WHERE
        ${whereClause.sql}
      ${groupBy.groupBy ? `GROUP BY ${groupBy.groupBy}` : ''}
    `;
    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    return sqlUtils.prepareReportResults(result.res.rows);
  }

  /**
   * @description Get total requested amount for approval requests that have not been fully reimbursed
   * @param {Object} kwargs - See get method for details
   * @returns {Array} - An array of objects with the requested amount and the aggregators
   */
  async getRequestedNotReimbursed(kwargs={}){
    const {aggregators, filters} = kwargs;

    const sqlUtils = new ReportSqlUtils({
      department: 'ar.department_id',
      employee: 'ar.employee_kerberos',
      fundingSource: 'arfs.funding_source_id',
      fiscalYear: 'ar.fiscal_year'
    });
    const whereArgs = {
      'ar.is_current': true,
      'ar.approval_status': 'approved',
      'ar.reimbursement_status': {operator: '!=', value: 'fully-reimbursed'}
    }
    const whereClause = sqlUtils.parseFilters(filters, whereArgs);
    const groupBy = sqlUtils.parseAggregators(aggregators);
    const sql = `
      SELECT
        SUM(arfs.amount) as ${sqlUtils.measureColumn}
        ${groupBy.select ? `, ${groupBy.select}` : ''}
      FROM
        approval_request ar
      JOIN
        approval_request_funding_source arfs ON arfs.approval_request_revision_id = ar.approval_request_revision_id
      WHERE
        ${whereClause.sql}
      ${groupBy.groupBy ? `GROUP BY ${groupBy.groupBy}` : ''}
    `;

    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    return sqlUtils.prepareReportResults(result.res.rows);

  }

  async getFullyReimbursed(kwargs={}){
    const {aggregators, filters} = kwargs;

    const sqlUtils = new ReportSqlUtils({
      department: 'ar.department_id',
      employee: 'ar.employee_kerberos',
      fundingSource: 'arfs.funding_source_id',
      fiscalYear: 'ar.fiscal_year'
    });

    const whereArgs = {
      'ar.is_current': true,
      'ar.approval_status': 'approved',
      'ar.reimbursement_status': 'fully-reimbursed',
      'rrf.reimbursement_status': 'submitted'
    }
    const whereClause = sqlUtils.parseFilters(filters, whereArgs);
    const groupBy = sqlUtils.parseAggregators(aggregators);

    const sql = `
      SELECT
        SUM(rrf.amount) as ${sqlUtils.measureColumn}
        ${groupBy.select ? `, ${groupBy.select}` : ''}
      FROM
        reimbursement_request_fund rrf
      LEFT JOIN
        reimbursement_request rr ON rrf.reimbursement_request_id = rr.reimbursement_request_id
      LEFT JOIN
        approval_request ar ON rr.approval_request_id = ar.approval_request_id
      LEFT JOIN
        approval_request_funding_source arfs ON rrf.approval_request_funding_source_id = arfs.approval_request_funding_source_id
      WHERE
        ${whereClause.sql}
      ${groupBy.groupBy ? `GROUP BY ${groupBy.groupBy}` : ''}
    `;

    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    return sqlUtils.prepareReportResults(result.res.rows);
  }

  async getReleaseTime(kwargs={}){
    const {aggregators, filters} = kwargs;

    const sqlUtils = new ReportSqlUtils({
      department: 'ar.department_id',
      employee: 'ar.employee_kerberos',
      fundingSource: 'arfs.funding_source_id',
      fiscalYear: 'ar.fiscal_year'
    });
    const whereClause = sqlUtils.parseFilters(filters, {'ar.is_current': true, 'ar.approval_status': 'approved'});
    const groupBy = sqlUtils.parseAggregators(aggregators);
    const sql = `
      SELECT
        SUM(ar.release_time) as ${sqlUtils.measureColumn}
        ${groupBy.select ? `, ${groupBy.select}` : ''}
      FROM
        approval_request ar
      JOIN
        approval_request_funding_source arfs ON arfs.approval_request_revision_id = ar.approval_request_revision_id
      WHERE
        ${whereClause.sql}
      ${groupBy.groupBy ? `GROUP BY ${groupBy.groupBy}` : ''}
    `;
    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    return sqlUtils.prepareReportResults(result.res.rows);
  }

  /**
   * @description Get the total allocated amount
   * @param {Object} kwargs - See get method for details
   * @returns
   */
  async getAllocated(kwargs={}){
    const {aggregators, filters} = kwargs;

    const sqlUtils = new ReportSqlUtils({
      department: 'ea.department_id',
      employee: 'ea.employee_kerberos',
      fundingSource: 'ea.funding_source_id',
      fiscalYear: 'ea.fiscal_year'
    });
    const whereClause = sqlUtils.parseFilters(filters, {'ea.deleted': false});
    const groupBy = sqlUtils.parseAggregators(aggregators);
    const sql = `
      SELECT
        SUM(ea.amount) as ${sqlUtils.measureColumn}
        ${groupBy.select ? `, ${groupBy.select}` : ''}
      FROM
        employee_allocation ea
      WHERE
        ${whereClause.sql}
      ${groupBy.groupBy ? `GROUP BY ${groupBy.groupBy}` : ''}
    `;
    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    return sqlUtils.prepareReportResults(result.res.rows);
  }


  /**
   * @description Get the access level of the user
   * @param {AccessToken} token - The user's access token
   * @returns {Object} {hasAccess: Boolean, departmentRestrictions: Array}
   * - hasAccess: Boolean - Whether the user has access to the reports
   * - departmentRestrictions: Array - An array of department ids that the user has access to. If empty, the user has access to all departments.
   */
  async getAccessLevel(token){
    const out = {
      hasAccess: false,
      departmentRestrictions: [],
    };

    if ( token.canAccessReports ){
      out.hasAccess = true;
      out.hasFullAccess = true;
      return out;
    }

    let employee = await employeeModel.getIamRecordById(token.id)
    if ( employee.error ) {
      return employee;
    }

    employee = new IamEmployeeObjectAccessor(employee.res);
    if ( !employee.isDepartmentHead ){
      return out;
    }

    out.hasAccess = true;
    out.departmentRestrictions.push(employee.department.id)

    const descendantDepartments = await departmentModel.getAllDescendantDepartments(employee.department.id);
    if ( descendantDepartments.error ) {
      return descendantDepartments;
    }
    out.departmentRestrictions.push(...descendantDepartments.map(department => department.id));

    return out;
  }

  /**
   * @description Get total number of approval requests by fiscal year
   * @param {Array} departments - An array of department ids to filter by. If empty, no filter is applied
   */
  async getFiscalYearCount(departments=[], table='approval_request'){
    if ( table !== 'approval_request' && table !== 'employee_allocation' ){
      return pg.returnError('Invalid table');
    }
    const whereArgs = {'1' : '1'};
    if ( table === 'approval_request' ){
      whereArgs[`${table}.is_current`] = true;
      whereArgs[`${table}.approval_status`] = 'approved';
    } else {
      whereArgs[`${table}.deleted`] = false;
    }

    if ( departments.length ){
      whereArgs[`${table}.department_id`] = departments;
    }
    const whereClause = pg.toWhereClause(whereArgs);

    const sql = `
      SELECT
        ${table}.fiscal_year,
        COUNT(${table}.*) as count
      FROM
        ${table}
      WHERE
        ${whereClause.sql}
      GROUP BY
        ${table}.fiscal_year
      ORDER BY
        ${table}.fiscal_year
    `;

    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    const fields = new EntityFields([
      {dbName: 'fiscal_year', jsonName: 'fiscalYear'},
      {dbName: 'count', jsonName: 'count'},
    ])
    return fields.toJsonArray(result.res.rows);
  }

  /**
   * @description Get the total number of approval requests by department
   * @param {Array} departments - An array of department ids to filter by. If empty, no filter is applied
   * @returns {Array|Object} - An array of objects with departmentId, label, archived, and count properties
   */
  async getDepartmentCount(departments=[], table='approval_request'){
    if ( table !== 'approval_request' && table !== 'employee_allocation' ){
      return pg.returnError('Invalid table');
    }
    const whereArgs = {'1' : '1'};
    if ( table === 'approval_request' ){
      whereArgs[`${table}.is_current`] = true;
      whereArgs[`${table}.approval_status`] = 'approved';
    } else {
      whereArgs[`${table}.deleted`] = false;
    }
    if ( departments.length ){
      whereArgs[`${table}.department_id`] = departments;
    }
    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT
        d.*,
        COUNT(${table}.*) as count
      FROM
        ${table}
      JOIN
        department d
        ON ${table}.department_id = d.department_id
      WHERE
        ${whereClause.sql}
      GROUP BY
        d.department_id
      ORDER BY
        d.label
    `;

    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    const fields = new EntityFields([
      {dbName: 'department_id', jsonName: 'departmentId'},
      {dbName: 'label', jsonName: 'label'},
      {dbName: 'archived', jsonName: 'archived'},
      {dbName: 'count', jsonName: 'count'},
    ])
    return fields.toJsonArray(result.res.rows);
  }

  /**
   * @description Merge the results of multiple count queries
   * @param {Array} queries - An array of promises that return the results of count queries
   * @param {String} key - Unique key to merge on
   * @param {String} countColumn - The column to sum
   * @returns {Array|Object} - An array of objects with at minimum the key and count properties
   */
  async mergeCountQueries(queries, key, countColumn='count'){
    let results = await Promise.allSettled(queries);
    for ( const result of results ){
      if ( result.status === 'rejected') {
        return {error: true, message: 'Error fetching count queries', details: result.reason};
      }
      if ( result.value.error ){
        return result.value;
      }
    }
    results = results.map(r => r.value);

    const out = [];
    for ( const result of results ){
      for ( const row of result ){
        row[countColumn] = Number(row[countColumn]);
        const existing = out.find(o => o[key] === row[key]);
        if ( existing ){
          existing[countColumn] += row[countColumn];
        } else {
          out.push(row);
        }
      }
    }

    return out;

  }

  /**
   * @description Get the total number of approval requests by employee
   * @param {Array} departments - An array of department ids to filter by. If empty, no filter is applied
   * @returns {Array|Object} - An array of objects with kerberos, firstName, lastName, archived, and count properties
   */
  async getEmployeeCount(departments=[], table='approval_request'){
    if ( table !== 'approval_request' && table !== 'employee_allocation' ){
      return pg.returnError('Invalid table');
    }
    const whereArgs = {'1' : '1'};
    if ( table === 'approval_request' ){
      whereArgs[`${table}.is_current`] = true;
      whereArgs[`${table}.approval_status`] = 'approved';
    } else {
      whereArgs[`${table}.deleted`] = false;
    }
    if ( departments.length ){
      whereArgs[`${table}.department_id`] = departments;
    }
    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT
        e.*,
        COUNT(${table}.*) as count
      FROM
        ${table}
      JOIN
        employee e
        ON ${table}.employee_kerberos = e.kerberos
      WHERE
        ${whereClause.sql}
      GROUP BY
        e.kerberos
      ORDER BY
        e.last_name, e.first_name
    `;

    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    const fields = new EntityFields([
      {dbName: 'kerberos', jsonName: 'kerberos'},
      {dbName: 'first_name', jsonName: 'firstName'},
      {dbName: 'last_name', jsonName: 'lastName'},
      {dbName: 'archived', jsonName: 'archived'},
      {dbName: 'count', jsonName: 'count'},
    ]);
    return fields.toJsonArray(result.res.rows);
  }

  async getFundingSourceCount(departments=[], table='approval_request'){
    if ( table !== 'approval_request' && table !== 'employee_allocation' ){
      return pg.returnError('Invalid table');
    }
    const whereArgs = {'1' : '1'};
    if ( table === 'approval_request' ){
      whereArgs[`${table}.is_current`] = true;
      whereArgs[`${table}.approval_status`] = 'approved';
    } else {
      whereArgs[`${table}.deleted`] = false;
    }
    if ( departments.length ){
      whereArgs[`${table}.department_id`] = departments;
    }
    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT
        fs.funding_source_id,
        fs.label,
        fs.archived,
        COUNT(${table}.*) as count
      FROM
        ${table}
      ${table === 'approval_request' ? `
        JOIN
          approval_request_funding_source arfs ON arfs.approval_request_revision_id = ${table}.approval_request_revision_id
        JOIN
          funding_source fs ON arfs.funding_source_id = fs.funding_source_id
        ` : `
        JOIN
          funding_source fs ON ${table}.funding_source_id = fs.funding_source_id
        `}
      WHERE
        ${whereClause.sql}
      GROUP BY
        fs.funding_source_id
      ORDER BY
        fs.label
    `;
    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    const fields = new EntityFields([
      {dbName: 'funding_source_id', jsonName: 'fundingSourceId'},
      {dbName: 'label', jsonName: 'label'},
      {dbName: 'archived', jsonName: 'archived'},
      {dbName: 'count', jsonName: 'count'},
    ]);
    return fields.toJsonArray(result.res.rows);
  }
}

export default new Reports();
