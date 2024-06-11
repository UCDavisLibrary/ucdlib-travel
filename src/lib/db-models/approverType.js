import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";
import employeeModel from "./employee.js";

/**
 * @class Admin Approver Type
 * @description Class for querying data about admin approver information
 */
class AdminApproverType {

  constructor(){
    this.entityFields = new EntityFields([
      {dbName: 'approver_type_id', jsonName: 'approverTypeId', required: true},
      {dbName: 'label', jsonName: 'label', required: true, userEditable: true},
      {dbName: 'description', jsonName: 'description', userEditable: true},
      {dbName: 'system_generated', jsonName: 'systemGenerated', customValidation: this.systemValidation.bind(this)},
      {dbName: 'hide_from_fund_assignment', jsonName: 'hideFromFundAssignment'},
      {dbName: 'archived', jsonName: 'archived'},
      {dbName: 'approval_order', jsonName: 'approvalOrder'},
      {dbName: 'employees', jsonName: 'employees', customValidation: this.kerberosValidation.bind(this)},
    ]);
  }

  /**
   * @description Query the approver type
   * @param {Object} kwargs - optional arguments including:
   * IDs: integer|array - Ids of approver types
   * status = active: string - if status is "active", return only active (non-archived) approver Types
   * status = archived: string - if status is "archived", return only archived (non-active) approver Types
   * @returns {Object|Array}
   *
   * all props in approver_type camelcased
   * employees property should be an empty array or array of kerberos ids in order designated in approver_type_employee
   */
  async query(kwargs){
    let idArray;

    if(typeof(kwargs.id) === "number"){
      idArray = [kwargs.id];
    } else {
      idArray = kwargs.id ? kwargs.id.split(',') : '';
    }
    const status = kwargs.status ? kwargs.status : '';

    const whereArgs = {};

    if(idArray != '') whereArgs['ap.approver_type_id'] = idArray;

    if(status == "archived") {
      whereArgs['ap.archived'] = true;
    } else if (status == "active"){
      whereArgs['ap.archived'] = false;
    }

    const whereClause = pg.toWhereClause(whereArgs);

    let query = `
    SELECT
        ap.*,
        (
            SELECT json_agg(json_build_object(
                'kerberos', emp.kerberos,
                'firstName', emp.first_name,
                'lastName', emp.last_name
            ))
            FROM employee emp
            WHERE ate.employee_kerberos = emp.kerberos
            ORDER BY ate.approval_order ASC
        ) AS employees
    FROM
        approver_type ap
    LEFT JOIN
        approver_type_employee ate ON ap.approver_type_id = ate.approver_type_id
    ${whereClause.sql ? `WHERE ${whereClause.sql}` : ''}
    `

    const res = await pg.query(query, whereClause.values);
    let r = this.entityFields.toJsonArray(res.res.rows);

    if( res.error ) return res;

    const data = this.queryFormat(r);
    return data;
  }

  /**
   * @description Formats the query results to combine the data based on approverTypeID
   * @param {Number} data - Query Results
   *
   * @returns {Array} Array of Objects for the combined results
   *
   */
  async queryFormat(data){
    const mergedData = data.reduce((acc, item) => {
      const existingItem = acc.find(element => element.approverTypeId === item.approverTypeId);
      if (existingItem) {
        existingItem.employees = existingItem.employees.concat(item.employees || []);
      } else {
        if ( !item.employees ) item.employees = [];
        acc.push(item);
      }
      return acc;
    }, []);
    return mergedData;
  }

  /**
   * @description Use data for employees validation
   * @param {Object} data - Object of Entity fields with camelcase
   *
   * @returns {Object} {status: false, message:""}
   */
  async systemValidation(field, value, out, payload){
    let error = {errorType: 'invalid', message: 'System Generated ApproverTypes can not be archived.  Set Archive to false.'};
    if(value && payload.archived) {
      out.valid = false;
      this.entityFields.pushError(out, field, error);
      return;
    }

    error = {errorType: 'invalid', message: 'System Generated ApproverTypes can not have employees.  Set employees to an empty array.'};
    if ( !value) return;

    if(!Array.isArray(payload.employees) || payload.employees.length != 0) {
      out.valid = false;
      this.entityFields.pushError(out, field, error);
      return;
    }
  }

  /**
   * @description Use data for kerberos validation
   * @param {Object} data - Object of Entity fields with camelcase
   *
   * @returns {Object} {status: false, message:""}
   */
  async kerberosValidation(field, value, out, payload){
    if ( payload.system_generated || payload.archived ) return;
    let error = {errorType: 'invalid', message: 'At least one employee must be assigned to a non-system generated approver type.'};
    if ( !Array.isArray(value) || value.length == 0 ) {
      this.entityFields.pushError(out, field, error);
      return;
    }
    const noKerberos = value.every(v => ( v.kerberos && v.kerberos != '' && v.kerberos != undefined));

    if ( !noKerberos ) {
      this.entityFields.pushError(out, field, error);
      return;
    }
  }

  /**
   * @description Create the admin approver type table
   * @param {Object} data - Object of Entity fields with camelcase
   *
   * @returns {Object} {error: false}
   */
  async create(data){
    data = this.entityFields.toDbObj(data);
    const validation = await this.entityFields.validate(data, ['approver_type_id']);

    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    const client = await pg.pool.connect();
    let out = {};
    let approverTypeId;

    try{
      let approverEmployee = data.employees || [];

      await client.query('BEGIN');

      delete data.approver_type_id;
      delete data.employees;

      data = pg.prepareObjectForInsert(data);

      const sql = `INSERT INTO approver_type (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING approver_type_id`;

      const res = await client.query(sql, data.values);
      approverTypeId  =  res.rows[0].approver_type_id;
        for (const [index, employee] of approverEmployee.entries()) {

          await employeeModel.upsertInTransaction(client, employee);

          const toEmployeeCreate = {
            'approver_type_id' : approverTypeId,
            'employee_kerberos': employee.kerberos,
            'approval_order': index
          };

          let approverEmployeeData = pg.prepareObjectForInsert(toEmployeeCreate);

          const employeeSql = `INSERT INTO approver_type_employee (${approverEmployeeData.keysString}) VALUES (${approverEmployeeData.placeholders})`;
          await client.query(employeeSql, approverEmployeeData.values);
        }
        await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      out.err = error;
    } finally {
      client.release();
    }

      out.res = await this.query({id: approverTypeId});
      out.err = false;

    return out;
  }

  /**
   * @description Update the admin approver type table
   * @param {Object} data - Object of Entity fields with camelcase
   * use a transaction if changes are needed to the employee list
   *
   * @returns {Object} {error: false}
   */
  async update(data){
    data = this.entityFields.toDbObj(data);

    const validation = await this.entityFields.validate(data);

    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    const client = await pg.pool.connect();
    let out = {};
    let approverTypeId;

    try{
      let approverEmployee = data.employees || [];
      approverTypeId = data.approver_type_id;

      await client.query('BEGIN');

      delete data.employees;

      const updateClause = pg.toUpdateClause(data);
      const sql = `
        UPDATE approver_type
        SET ${updateClause.sql}
        WHERE approver_type_id = $${updateClause.values.length + 1}
        RETURNING approver_type_id
      `;

      await client.query(`DELETE FROM approver_type_employee WHERE approver_type_id = ($1)`, [approverTypeId]);
      await client.query(sql, [...updateClause.values, approverTypeId]);

      for (const [index, employee] of approverEmployee.entries()) {
        await employeeModel.upsertInTransaction(client, employee);

        const toEmployeeUpdate = {
          'approver_type_id' : approverTypeId,
          'employee_kerberos': employee.kerberos,
          'approval_order': index
        };

        let approverEmployeeData = pg.prepareObjectForInsert(toEmployeeUpdate);

        const employeeSql = `INSERT INTO approver_type_employee (${approverEmployeeData.keysString}) VALUES (${approverEmployeeData.placeholdersString}) RETURNING *`;
        await client.query(employeeSql, approverEmployeeData.values);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      out.err = error;
    } finally {
      client.release();
    }
    out.res = await this.query({id: approverTypeId});
    out.err = false;

    return out;
  }
}

export default new AdminApproverType();
