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

}

export default new EmployeeAllocation();
