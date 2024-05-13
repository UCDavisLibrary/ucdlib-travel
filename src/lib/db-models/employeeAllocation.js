import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";
import employeeModel from "./employee.js";

class EmployeeAllocation {

  constructor(){

    this.entityFields = new EntityFields([
      {
        dbName: 'employee_allocation_id',
        jsonName: 'employeeAllocationId',
        required: true
      },
      {
        dbName: 'employee',
        jsonName: 'employee'
      },
      {
        dbName: 'employees',
        jsonName: 'employees',
        customValidation: this.validateEmployeeList.bind(this)
      },
      {
        dbName: 'employee_kerberos',
        jsonName: 'employeeKerberos'
      },
      {
        dbName: 'funding_source_id',
        jsonName: 'fundingSourceId',
        required: true,
        validateType: 'integer'
      },
      {
        dbName: 'funding_source_label',
        jsonName: 'fundingSourceLabel'
      },
      {
        dbName: 'start_date',
        jsonName: 'startDate',
        validateType: 'date',
        required: true,
        customValidation: this.validateDateRange.bind(this)
      },
      {
        dbName: 'end_date',
        jsonName: 'endDate',
        validateType: 'date',
        required: true,
        customValidation: this.validateDateRange.bind(this)
      },
      {
        dbName: 'amount',
        jsonName: 'amount',
        required: true,
        validateType: 'number'
      },
      {
        dbName: 'added_by',
        jsonName: 'addedBy'
      },
      {
        dbName: 'added_at',
        jsonName: 'addedAt'
      },
      {
        dbName: 'deleted',
        jsonName: 'deleted'
      },
      {
        dbName: 'deleted_by',
        jsonName: 'deletedBy'
      },
      {
        dbName: 'deleted_at',
        jsonName: 'deletedAt'
      }
    ]);
  }

  /**
   * @description Create a new employee allocation
   * @param {Object} data - allocation data - see entityFields.
   * Takes multiple employees (in the employees field) and creates an allocation for each.
   * @param {Object} submittedBy - employee object of the user submitting the allocation
   */
  async create(data, submittedBy={}){

    data = this.entityFields.toDbObj(data);
    const validation = this.entityFields.validate(data, ['employee_allocation_id']);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }
    delete data.employee_allocation_id;
    delete data.employee;

    // check if an allocation already exists for this date range, funding source, and employees
    // wont break the db if a duplicate is inserted, but it's not a user pattern we want to happen
    const existingAllocations = await this.allocationExists(data.start_date, data.end_date, data.funding_source_id, data.employees.map(e => e.kerberos));
    if ( existingAllocations.error ) return existingAllocations;
    if ( Object.values(existingAllocations.res).some(v => v) ) {
      const field = {...this.entityFields.fields.find(f => f.jsonName === 'employees')};
      const employees = data.employees.filter(e => existingAllocations.res[e.kerberos]);
      const message = 'An allocation already exists for this date range and funding source for the following employees:';
      field.errors = [{errorType: 'already-exists', message, employees}];
      return {
        error: true,
        message: 'Validation Error',
        is400: true,
        fieldsWithErrors: [field]
      }
    }

    let out = {};
    const client = await pg.pool.connect();

    try {
      await client.query('BEGIN');

      // make sure all employees are in the database
      for (const employee of data.employees) {
        await employeeModel.upsertInTransaction(client, employee);
      }

      // add who submitted the allocation
      if ( submittedBy.kerberos ) {
        data.added_by = submittedBy.kerberos;
        await employeeModel.upsertInTransaction(client, submittedBy);
      }

      // insert allocation for each employee
      for (const employee of data.employees) {
        employee.added_at = new Date();
        let d = {...data, 'employee_kerberos': employee.kerberos };
        delete d.employees;
        d = pg.prepareObjectForInsert(d);
        const sql = `INSERT INTO employee_allocation (${d.keysString}) VALUES (${d.placeholdersString}) RETURNING employee_allocation_id`;
        await client.query(sql, d.values);

        out = [];
        // todo retrieve the full inserted record when method is built
      }

      await client.query('COMMIT')

    }catch (e) {
      await client.query('ROLLBACK');
      out = {error: e};
    } finally {
      client.release();
    }

    return out;
  }

  /**
   * @description Check if an allocation exists for a given date range, funding source for a list of employees
   * @param {String} startDate - start date in format YYYY-MM-DD
   * @param {String} endDate - end date in format YYYY-MM-DD
   * @param {Number} fundingSourceId - funding source id
   * @param {Array} kerberosIds - array of kerberos ids
   * @returns {Object} {error, res} where res is an object with kerberos ids as keys and boolean values indicating if an allocation exists
   */
  async allocationExists(startDate, endDate, fundingSourceId, kerberosIds ) {
    const sql = `
      SELECT employee_kerberos, true as allocation_exists
      FROM employee_allocation
      WHERE start_date = $1 AND end_date = $2 AND funding_source_id = $3 AND employee_kerberos = ANY($4)
    `;
    const res = await pg.query(sql, [startDate, endDate, fundingSourceId, kerberosIds]);
    if ( res.error ) return res;
    const out = {};
    for (const row of res.res.rows) {
      out[row.employee_kerberos] = row.allocation_exists;
    }
    return {res: out};
  }

  /**
   * @description Validate that the employees field is an array of valid employee objects.
   * See EntityFields.validate method for signature.
   */
  validateEmployeeList(field, value, out) {
    let error = {errorType: 'required', message: 'At least one employee is required'};
    if ( !Array.isArray(value) || value.length === 0 ) {
      out.valid = false;
      this.entityFields.pushError(out, field, error);
      return;
    }
    error = {errorType: 'invalid', message: 'Invalid employee object'};
    for (const employee of value) {
      if ( !employee || !employee.kerberos ) {
        out.valid = false;
        this.entityFields.pushError(out, field, error);
        return;
      }
    }
  }

  /**
   * @description Validate that the start date is before the end date.
   * See EntityFields.validate method for signature.
   */
  validateDateRange(field, value, out, payload) {
    if ( this.entityFields.fieldHasError(out, 'startDate') || this.entityFields.fieldHasError(out, 'endDate') ) return;
    const startDate = new Date(payload.start_date);
    const endDate = new Date(payload.end_date);
    if ( startDate < endDate ) return;
    out.valid = false;
    const error = {errorType: 'invalid', message: 'Start date must be before end date'};
    if ( field.jsonName === 'endDate' ) {
      error.message = 'End date must be after start date';
    }
    this.entityFields.pushError(out, field, error);
  }

  /**
   * @description Get list of employee allocations
   * @param {Object} kwargs - optional arguments including:
   * - startDate: object - {value: string, operator: string} - start date in format YYYY-MM-DD (optional)
   * - endDate: object - {value: string, operator: string} - end date in format YYYY-MM-DD (optional)
   * - employees: array - array of employee kerberos ids to include (optional)
   * - fundingSources: array - array of funding source ids to include (optional)
   * - page: number - page number for pagination (optional) - default 1
   */
  async get(kwargs={}){
    const page = Number(kwargs.page) ? Number(kwargs.page) : 1;

    const pageSize = 10;
    const whereArgs = {};
    whereArgs['ea.deleted'] = false;
    if ( kwargs.startDate ) {
      whereArgs['ea.start_date'] = kwargs.startDate;
    }
    if ( kwargs.endDate ) {
      whereArgs['ea.end_date'] = kwargs.endDate;
    }
    if ( kwargs.employees && kwargs.employees.length ) {
      whereArgs['ea.employee_kerberos'] = kwargs.employees;
    }
    if ( kwargs.fundingSources && kwargs.fundingSources.length) {
      whereArgs['ea.funding_source_id'] = kwargs.fundingSources;
    }
    const whereClause = pg.toWhereClause(whereArgs);


    const countQuery = `
    SELECT
      COUNT(*) AS total
    FROM
      employee_allocation ea
    WHERE ${whereClause.sql};
    `;
    const countRes = await pg.query(countQuery, whereClause.values);
    if( countRes.error ) return countRes;
    const total = countRes.res.rows[0].total;

    const query = `
    SELECT
     ea.*,
     json_build_object(
        'kerberos', e.kerberos,
        'firstName', e.first_name,
        'lastName', e.last_name
      ) AS employee
    FROM
      employee_allocation ea
    JOIN
      employee e ON e.kerberos = ea.employee_kerberos
    WHERE ${whereClause.sql}
    ORDER BY
      ea.start_date DESC,
      ea.end_date DESC
    LIMIT ${pageSize} OFFSET ${pageSize * (page - 1)};
    `;
    const res = await pg.query(query, whereClause.values);
    if( res.error ) return res;

    const data = this.entityFields.toJsonArray(res.res.rows);
    const totalPages = Math.ceil(total / pageSize);
    return {total, totalPages, page, data};

  }

  /**
   * @description Get list of employees with their total allocations
   * @param {Object} kwargs - optional arguments including:
   * - startDate: object - {value: string, operator: string} - start date in format YYYY-MM-DD (optional)
   * - endDate: object - {value: string, operator: string} - end date in format YYYY-MM-DD (optional)
   * - employees: array - array of employee kerberos ids to include (optional)
   * @returns {Array|Object} Object with error property if error, otherwise array of employee objects:
   * {
   *  kerberos: string,
   *  firstName: string,
   *  lastName: string,
   *  totalAllocation: number,
   *  fundingSources: [
   *   {
   *   fundingSourceId: number,
   *   label: string,
   *   totalAllocation: number
   *   }
   *  ]
   * }
   */
  async getTotalByUser(kwargs={}){
    const whereArgs = {};
    whereArgs['ea.deleted'] = false;
    if ( kwargs.startDate ) {
      whereArgs['ea.start_date'] = kwargs.startDate;
    }
    if ( kwargs.endDate ) {
      whereArgs['ea.end_date'] = kwargs.endDate;
    }
    if ( kwargs.employees ) {
      whereArgs['ea.employee_kerberos'] = kwargs.employees;
    }
    const whereClause = pg.toWhereClause(whereArgs);
    const query = `
    WITH allocations AS (
      SELECT
        ea.employee_kerberos,
        ea.funding_source_id,
        SUM(ea.amount) AS total_allocation
      FROM
        employee_allocation ea
      WHERE ${whereClause.sql}
      GROUP BY
        ea.employee_kerberos, ea.funding_source_id
    )
    SELECT
      e.kerberos,
      e.first_name,
      e.last_name,
      COALESCE(SUM(a.total_allocation), 0) AS total_allocation,
      (
        SELECT
          json_agg(json_build_object(
            'fundingSourceId', f.funding_source_id,
            'label', f.label,
            'totalAllocation', fa.total_allocation
          ))
        FROM
          allocations fa
        JOIN
          funding_source f ON f.funding_source_id = fa.funding_source_id
        WHERE
          fa.employee_kerberos = e.kerberos
      ) AS funding_sources
    FROM
      allocations a
    JOIN
      employee e ON e.kerberos = a.employee_kerberos
    GROUP BY
      e.kerberos
    HAVING
      COALESCE(SUM(a.total_allocation), 0) > 0;
    `;
    const res = await pg.query(query, whereClause.values);
    if( res.error ) return res;

    const fields = new EntityFields([
      {dbName: 'kerberos', jsonName: 'kerberos'},
      {dbName: 'first_name', jsonName: 'firstName'},
      {dbName: 'last_name', jsonName: 'lastName'},
      {dbName: 'total_allocation', jsonName: 'totalAllocation'},
      {dbName: 'funding_sources', jsonName: 'fundingSources'}
    ]);
    return fields.toJsonArray(res.res.rows);

  }

}

export default new EmployeeAllocation();
