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
          {dbName: 'employees', jsonName: 'employees'},

        ]);
        this.entityEmployeeFields = new EntityFields([
          {dbName: 'approver_type_id', jsonName: 'approverTypeId', required: true},
          {dbName: 'employee_kerberos', jsonName: 'employees', required: true},
          {dbName: 'approval_order', jsonName: 'approvalOrder'},

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
        let id;
        let idArray = kwargs.id ? JSON.parse(kwargs.id): '';
        const whereArgs = {};


        if(idArray != ''){
          if(Array.isArray(idArray)) {
              id = idArray;
          } else {
              id = [idArray];
          }
          whereArgs['ap.approver_type_id'] = Array.isArray(idArray) ? idArray : [idArray];
        } 


        if(kwargs["status"] == "archived") {
          whereArgs['ap.archived'] = true;
        } else if (kwargs["status"] == "active"){
          whereArgs['ap.archived'] = false;
        } 

        const whereClause = pg.toWhereClause(whereArgs);

        let query = `
        SELECT 
        json_agg(json_build_object(
            'approverTypeID', ap.approver_type_id,
            'label', ap.label,
            'description', ap.description,
            'systemGenerated', ap.system_generated,
            'hide_from_fund_assignment', ap.hide_from_fund_assignment,
            'archived', ap.archived,
            'approvalOrder', ate.approval_order,
            'employees', json_build_object(
                'kerberos', emp.kerberos,
                'firstName', emp.first_name,
                'lastName', emp.last_name,
                'approvalOrder', ate.approval_order
            )
        ) ORDER BY ate.approval_order) AS approver_types
        FROM 
            approver_type ap
        LEFT JOIN 
            approver_type_employee ate ON ap.approver_type_id = ate.approver_type_id
        LEFT JOIN 
            employee emp ON ate.employee_kerberos = emp.kerberos
        ${whereClause.sql ? `WHERE ${whereClause.sql}` : ''}
        `

        const res = await pg.query(query, whereClause.values);
        let r = res.res.rows[0].approver_types;

        if( res.error ) return res;
        const data = this.queryFormat(r);

        return data;
      }

      /**
       * @description Check if Employee Exists in the approver_type table and delete to replace
       * @param {Number} id - ID Employee

       */
        async queryFormat(array){      
          let output = [];
          array.forEach(function(item) {
            var existing = output.filter(function(v, i) {
              return v.approverTypeID == item.approverTypeID;
            });
            if (existing.length) {
              var existingIndex = output.indexOf(existing[0]);
              output[existingIndex].employees = [output[existingIndex].employees].concat([item.employees]);
            } else {
              if (typeof item.employees == 'string')
                item.employees = [item.employees];
              output.push(item);
            }
          });
          return output;
        }

      /**
       * @description Use data for system validation
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
        if(value && payload["employees"].length != 0) {
          out.valid = false;
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
        const client = await pg.pool.connect();
        let out = {};
        let approverTypeId;
          try{

            await client.query('BEGIN');

            let approverEmployee = data.employees;

            const noKerberos = approverEmployee.every(a => ( a.employee.kerberos && a.employee.kerberos != '' && a.employee.kerberos != undefined))
   
            if ( !noKerberos ) {
              return {error: true, message: 'Employee Kerberos Error', is400: true};
            }


            data = this.entityFields.toDbObj(data);
            const validation = this.entityFields.validate(data, ['approver_type_id']);
            if ( !validation.valid ) {
              return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
            }
    

            delete data.approver_type_id;
            delete data.employees;

            data = pg.prepareObjectForInsert(data);

            const sql = `INSERT INTO approver_type (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING approver_type_id`;
            const res = await pg.query(sql, data.values);
            approverTypeId  =  res.res.rows[0].approver_type_id;

            if ( Object.keys(approverEmployee).length ) {

              for (const [index, a] of approverEmployee.entries()) {
                await employeeModel.upsertInTransaction(client, a.employee);

                const toEmployeeCreate = {};
                if ( approverTypeId ) {
                  toEmployeeCreate['approver_type_id'] = approverTypeId;
                }
                if ( a.employee.kerberos ) {
                  toEmployeeCreate['employee_kerberos'] = a.employee.kerberos;
                }
                if ( a.approvalOrder ){
                  toEmployeeCreate['approval_order'] = index;
                }
                if ( !Object.keys(toEmployeeCreate).length ){
                  return pg.returnError('no valid fields to update');
                }
    
                let approverEmployeeData = pg.prepareObjectForInsert(toEmployeeCreate);

                const employeeSql = `INSERT INTO approver_type_employee (${approverEmployeeData.keysString}) VALUES (${approverEmployeeData.placeholders})`;
                await client.query(employeeSql, approverEmployeeData.values);
              }
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
        const client = await pg.pool.connect();
        let out = {};
        let approverTypeId;
        try{

          await client.query('BEGIN');
          let approverEmployee = data.employees;

          const noKerberos = approverEmployee.every(a => ( a.employee.kerberos && a.employee.kerberos != '' && a.employee.kerberos != undefined))

          if ( !noKerberos ) {
            return {error: true, message: 'Employee Kerberos Error', is400: true};
          }


          data = this.entityFields.toDbObj(data);
          const validation = this.entityFields.validate(data);
          if ( !validation.valid ) {
            return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
          } 

          approverTypeId = data.approver_type_id;

          delete data.employees;

          const updateClause = pg.toUpdateClause(data);
          const sql = `
            UPDATE approver_type
            SET ${updateClause.sql}
            WHERE approver_type_id = $${updateClause.values.length + 1}
            RETURNING approver_type_id
          `;

          await pg.query(`DELETE FROM approver_type_employee WHERE approver_type_id = ($1)`, [approverTypeId]);
          const res = await pg.query(sql, [...updateClause.values, approverTypeId]);

          if ( Object.keys(approverEmployee).length ) {
            for (const [index, a] of approverEmployee.entries()) {
              await employeeModel.upsertInTransaction(client, a.employee);

              const toEmployeeUpdate = {};
              if ( approverTypeId ) {
                toEmployeeUpdate['approver_type_id'] = approverTypeId;
              }
              if ( a.employee.kerberos ) {
                toEmployeeUpdate['employee_kerberos'] = a.employee.kerberos;
              }
              if ( a.approvalOrder ){
                toEmployeeUpdate['approval_order'] = index;
              }
              if ( !Object.keys(toEmployeeUpdate).length ){
                return pg.returnError('no valid fields to update');
              }

              let approverEmployeeData = pg.prepareObjectForInsert(toEmployeeUpdate);
              const employeeSql = `INSERT INTO approver_type_employee (${approverEmployeeData.keysString}) VALUES (${approverEmployeeData.placeholdersString}) RETURNING *`;
              await client.query(employeeSql, approverEmployeeData.values);
            }
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
