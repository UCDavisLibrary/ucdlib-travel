import pg from "./pg.js";
import employeeModel from './employee.js';
import departmentModel from './department.js';
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
   * @returns
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

    return reportsRequired.map(({report, data}) => ({report, data}));
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
   * @param {Boolean} includeCurrentYear - If true, include the current fiscal year in the results even if there are no approval requests
   */
  async getFiscalYearCount(departments=[], includeCurrentYear=false){

    const whereArgs = {
      'ar.is_current': true,
      'ar.approval_status': 'approved'
    }
    if ( departments.length ){
      whereArgs['ar.department_id'] = departments;
    }
    const whereClause = pg.toWhereClause(whereArgs);

    const sql = `
      SELECT
        ar.program_start_date,
        COUNT(ar.*) as count
      FROM
        approval_request ar
      WHERE
        ${whereClause.sql} AND ar.program_start_date IS NOT NULL
      GROUP BY
        ar.program_start_date
    `;

    const result = await pg.query(sql, whereClause.values);
    if ( result.error ) {
      return result;
    }

    const out = [];
    for ( const row of result.res.rows ){
      const fy = fiscalYearUtils.fromDate(row.program_start_date);
      const count = Number(row.count);
      const d = out.find(o => o.fiscalYear.startYear === fy.startYear);
      if ( d ){
        d.count += count;
      } else {
        out.push({fiscalYear: fy, count});
      }
    }

    if ( includeCurrentYear ){
      const currentFiscalYear = fiscalYearUtils.current();
      const d = out.find(o => o.fiscalYear.startYear === currentFiscalYear.startYear);
      if ( !d ){
        out.push({fiscalYear: currentFiscalYear, count: 0});
      }
    }

    out.sort((a, b) => a.fiscalYear.startYear - b.fiscalYear.startYear);

    return out;
  }

  /**
   * @description Get the total number of approval requests by department
   * @param {Array} departments - An array of department ids to filter by. If empty, no filter is applied
   * @returns {Array|Object} - An array of objects with departmentId, label, archived, and count properties
   */
  async getDepartmentCount(departments=[]){
    const whereArgs = {
      'ar.is_current': true,
      'ar.approval_status': 'approved'
    }
    if ( departments.length ){
      whereArgs['ar.department_id'] = departments;
    }
    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT
        d.*,
        COUNT(ar.*) as count
      FROM
        approval_request ar
      JOIN
        department d
        ON ar.department_id = d.department_id
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
   * @description Get the total number of approval requests by employee
   * @param {Array} departments - An array of department ids to filter by. If empty, no filter is applied
   * @returns {Array|Object} - An array of objects with kerberos, firstName, lastName, archived, and count properties
   */
  async getEmployeeCount(departments=[]){
    const whereArgs = {
      'ar.is_current': true,
      'ar.approval_status': 'approved'
    }
    if ( departments.length ){
      whereArgs['ar.department_id'] = departments;
    }
    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT
        e.*,
        COUNT(ar.*) as count
      FROM
        approval_request ar
      JOIN
        employee e
        ON ar.employee_kerberos = e.kerberos
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

  async getFundingSourceCount(departments=[]){
    const whereArgs = {
      'ar.is_current': true,
      'ar.approval_status': 'approved'
    }
    if ( departments.length ){
      whereArgs['ar.department_id'] = departments;
    }
    const whereClause = pg.toWhereClause(whereArgs);
    const sql = `
      SELECT
        fs.funding_source_id,
        fs.label,
        fs.archived,
        COUNT(ar.*) as count
      FROM
        approval_request ar
      JOIN
        approval_request_funding_source arfs ON arfs.approval_request_revision_id = ar.approval_request_revision_id
      JOIN
        funding_source fs ON arfs.funding_source_id = fs.funding_source_id
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
