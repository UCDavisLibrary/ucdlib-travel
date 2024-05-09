import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";

/**
 * @class Admin Approver Type
 * @description Class for querying data about admin approver information
 */
class AdminApproverType {

    constructor(){
        this.entityFields = new EntityFields([
          {dbName: 'approver_type_id', jsonName: 'approverTypeId', required: true, userEditable: true},
          {dbName: 'label', jsonName: 'label', required: true, userEditable: true},
          {dbName: 'description', jsonName: 'description'},
          {dbName: 'system_generated', jsonName: 'systemGenerated'},
          {dbName: 'hide_from_fund_assignment', jsonName: 'hideFromFundAssignment'},
          {dbName: 'archived', jsonName: 'archived'},
          {dbName: 'employees', jsonName: 'archived'},

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
        let res, id;
        let idArray = JSON.parse(kwargs.id);
        let query = `SELECT * FROM approver_type WHERE`;


        if(Array.isArray(idArray)) {
            id = idArray;
        } else {
            id = [idArray];
        }
        let v = pg.valuesArray(id);

        query += ` approver_type_id in ${v}`;

        if(kwargs["status"] == "archived") {
          query += ` AND archived = true`;
        } else if (kwargs["status"] == "active"){
          query += ` AND archived = false`;
        } 

        res = await pg.query(query, id);

        if( res.error ) return res;
        const data = this.entityFields.toJsonArray(res.res.rows);


        return data;
      }
    


      /**
       * @description Check if Employee Exists in employee table and insert if not
       * @param {Object} employee - Employee Object
       */
      async existsEmployee(employee){
        const client = await pg.pool.connect();

        let employeeExists = await pg.query(`SELECT * FROM employee WHERE kerberos = ($1)`, [employee.kerberos]);

        let employeeObj = {
          "kerberos":employee.kerberos, 
          "first_name": employee.first_name, 
          "last_name":employee.last_name, 
          "department_id":employee.department
        }; 

        if(!employeeExists.res.rows.length) {
          let data = pg.prepareObjectForInsert(employeeObj);
          return await client.query(`INSERT INTO employee (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING *`, data.values);
        } else {
          const updateEmployeeClause = pg.toUpdateClause(employeeObj);
          return await client.query(`UPDATE employee SET ${updateEmployeeClause.sql}
                    WHERE kerberos = $${updateEmployeeClause.values.length + 1}
                    RETURNING *`, [...updateEmployeeClause.values, employee.kerberos]);;
        }
        
      }



      /**
       * @description Check if Employee Exists in the approver_type table and delete to replace
       * @param {Number} id - ID Employee

       */
        async approverEmployeeCheck(id){
          const client = await pg.pool.connect();
          let employeeExists = await client.query(`SELECT * FROM approver_type_employee WHERE approver_type_id = ($1)`, [id]);
          if(employeeExists.rowCount){
            return await pg.query(`DELETE FROM approver_type_employee WHERE approver_type_id = ($1)`, [id]);
          }
          return false
        }

      /**
       * @description Use data for system validation
       * @param {Object} data - Object of Entity fields with camelcase
       * 
       * @returns {Object} {status: false, message:""}
       */
       async systemValidation(data){
        if(data.systemGenerated && data.archived) {
          return {status:false, message: "System Generated ApproverTypes can not be archived.  Set Archive to false."};
        }
        if(data.systemGenerated && data["employees"].length != 0) {
          return {status:false, message: "System Generated ApproverTypes can not have employees.  Set employees to an empty array."};
        }
        return {status:true, message:""}
       }

      /**
       * @description Create the admin approver type table
       * @param {Object} data - Object of Entity fields with camelcase
       * 
       * @returns {Object} {error: false}
       */
       async create(data){

        let systemValidate = await this.systemValidation(data);
        if(!systemValidate.status) return {error: true, message: systemValidate.message, is400: true};


        const client = await pg.pool.connect();
        const out = {res: [], err: false};

        await client.query('BEGIN');

        let approverEmployee = data.employees;

        data = this.entityFields.toDbObj(data);
        const validation = this.entityFields.validate(data, ['approver_type_id']);

        if ( !validation.valid ) {
          return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
        }

        delete data.approver_type_id;
        if(!data.employees) delete data.employees;

        data = pg.prepareObjectForInsert(data);
        const sql = `INSERT INTO approver_type (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING *`;

        if ( Object.keys(approverEmployee).length === 0 ) {
          const res = await pg.query(sql, data.values);
          if( res.error ) return res;
          return this.entityFields.toJsonObj(res.res.rows);
        }

        try{
          const approverType = await client.query(sql, data.values);
          out.res.push(approverType);

          const approverTypeId = approverType.rows[0].approver_type_id;

          for (const a of approverEmployee) {
            const newEmployee = await this.existsEmployee(a.employee);

            const toEmployeeCreate = {};
            if ( approverTypeId ) {
              toEmployeeCreate['approver_type_id'] = approverTypeId;
            }
            if ( a.employee.kerberos ) {
              toEmployeeCreate['employee_kerberos'] = a.employee.kerberos;
            }
            if ( a.approvalOrder ){
              toEmployeeCreate['approval_order'] = a.approvalOrder;
            }
            if ( !Object.keys(toEmployeeCreate).length ){
              return pg.returnError('no valid fields to update');
            }

            let approverEmployeeData = pg.prepareObjectForInsert(toEmployeeCreate);
            const employeeSql = `INSERT INTO approver_type_employee (${approverEmployeeData.keysString}) VALUES (${approverEmployeeData.placeholdersString}) RETURNING *`;

            const r = await client.query(employeeSql, approverEmployeeData.values);

            out.res.push(r);
          }
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          out.err = error;
        } finally {
          client.release();
        }

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
        let systemValidate = await this.systemValidation(data);
        if(!systemValidate.status) return {error: true, message: systemValidate.message, is400: true};

        const client = await pg.pool.connect();
        const out = {res: [], err: false};

        await client.query('BEGIN');
        let approverEmployee = data.employees;

        data = this.entityFields.toDbObj(data);

        const validation = this.entityFields.validate(data);
        if ( !validation.valid ) {
          return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
        } 
        const id = data.approver_type_id;

        if(!data.employees) delete data.employees;

        const updateClause = pg.toUpdateClause(data);
        const sql = `
          UPDATE approver_type
          SET ${updateClause.sql}
          WHERE approver_type_id = $${updateClause.values.length + 1}
          RETURNING *
        `;

        if ( Object.keys(approverEmployee).length === 0 ) {
          let currentEmployees = this.approverEmployeeCheck(id);

          const res = await pg.query(sql, [...updateClause.values, id]);
          if( res.error ) return res;
          return this.entityFields.toJsonObj(res.res.rows);
        } 

        try{
          const approverType = await client.query(sql, [...updateClause.values, id]);
          out.res.push(approverType);
          const approverTypeId = approverType.rows[0].approver_type_id;
          let employeeApproverCheck = await this.approverEmployeeCheck(approverTypeId);

          for (const a of approverEmployee) {

            const newEmployee = await this.existsEmployee(a.employee);

            const toEmployeeUpdate = {};
            if ( approverTypeId ) {
              toEmployeeUpdate['approver_type_id'] = approverTypeId;
            }
            if ( a.employee.kerberos ) {
              toEmployeeUpdate['employee_kerberos'] = a.employee.kerberos;
            }
            if ( a.approvalOrder ){
              toEmployeeUpdate['approval_order'] = a.approvalOrder;
            }
            if ( !Object.keys(toEmployeeUpdate).length ){
              return pg.returnError('no valid fields to update');
            }

            let approverEmployeeData = pg.prepareObjectForInsert(toEmployeeUpdate);
            const employeeSql = `INSERT INTO approver_type_employee (${approverEmployeeData.keysString}) VALUES (${approverEmployeeData.placeholdersString}) RETURNING *`;
            const r = await client.query(employeeSql, approverEmployeeData.values);
            out.res.push(r);

          }
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          out.err = error;
        } finally {
          client.release();
        }
        return out;

      }
}
export default new AdminApproverType();
