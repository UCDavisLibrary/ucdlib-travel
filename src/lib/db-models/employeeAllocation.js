import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";
import employeeModel from "./employee.js";

class EmployeeAllocation {

  constructor(){

    this.entityFields = new EntityFields([
      {dbName: 'employee_allocation_id', jsonName: 'employeeAllocationId', required: true},
      {dbName: 'employee', jsonName: 'employee'},
      {dbName: 'employees', jsonName: 'employees', customValidation: this.validateEmployeeList.bind(this)},
      {dbName: 'funding_source_id', jsonName: 'fundingSourceId'},
      {dbName: 'funding_source_label', jsonName: 'fundingSourceLabel'},
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
      {dbName: 'amount', jsonName: 'amount'},
      {dbName: 'added_by', jsonName: 'addedBy'},
      {dbName: 'added_at', jsonName: 'addedAt'},
      {dbName: 'deleted', jsonName: 'deleted'},
      {dbName: 'deleted_by', jsonName: 'deletedBy'},
      {dbName: 'deleted_at', jsonName: 'deletedAt'}
    ]);
  }

  async create(data){

    data = this.entityFields.toDbObj(data);
    const validation = this.entityFields.validate(data, ['employee_allocation_id']);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    let out = {};
    const client = await pg.pool.connect();

    try {
      await client.query('BEGIN');
      for (const employee of data.employees) {
        await employeeModel.upsertInTransaction(client, employee);
      }
      await client.query('COMMIT')
    }catch (e) {
      await client.query('ROLLBACK');
      out.error = e;
    } finally {
      client.release();
    }

    return out;
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
