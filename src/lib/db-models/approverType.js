import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";

/**
 * @class Admin Approver Type
 * @description Class for querying data about admin approver information
 */
class AdminApproverType {

    constructor(){
        this.entityFields = new EntityFields([
          {dbName: 'approver_type_id', jsonName: 'approverTypeId'},
          {dbName: 'label', jsonName: 'label'},
          {dbName: 'description', jsonName: 'description', userEditable: true},
          {dbName: 'system_generated', jsonName: 'systemGenerated'},
          {dbName: 'hide_from_fund_assignment', jsonName: 'hideFromFundAssignment'},
          {dbName: 'archived', jsonName: 'archived', userEditable: true},
        ]);
      }
      /**
       * @description Query the approver type
       * @param {Object} args - object of ids, archive, active
       * @returns {Object|Array}
       * 
       * all props in approver_type camelcased
       * employees property should be an empty array or array of kerberos ids in order designated in approver_type_employee
       */
      async query(args){
        let res;
        let archive = "false"
        
        if(args["status"] == "archived") archive = "true";
         
        console.log(args);

        if(Array.isArray(args["id"])) {
            let v = pg.valuesArray(args.id);

            let text = `SELECT * FROM approver_type WHERE approver_type_id in ${v} AND archived IS ` + archive;

            res = await pg.query(text, args.id);

        } else {
            let text = `SELECT * FROM approver_type WHERE approver_type_id = $1 AND archived IS ` + archive;

            res = await pg.query(text, [args.id]);

          }

        if( res.error ) return res;
        const data = this.entityFields.toJsonArray(res.res.rows);


        return data;
      }
    

      /**
       * @description Converts camelCase to underscores (snakecase) for column names
       */
      underscore(s){
        return s.split(/\.?(?=[A-Z])/).join('_').toLowerCase();
      }


      /**
       * @description Create the admin approver type table
       * @param {Object} data - admin approverType object including list of employees
       * 
       * 
       * {
          "label": "label",
          "description": "descripton",
          "systemGenerated": false,
          "hideFromFundAssignment": false,
          "archived": false,
          "employees":{
            "employeeKerberos":"kerberos",
            "approvalOrder": 3
          }
         }
       * 
       * 
       * @returns {Object} {error: false}
       */
       async create(data){
        let text = 'INSERT INTO approver_type (';
        let props = [
          'label', 'description', 'systemGenerated', 'hideFromFundAssignment',
          'archived'
        ];
        console.log(data);
        let approverEmployee = data.employees;
        console.log(approverEmployee);

        const values = [];
        let first = true;
        for (const prop of props) {
          if ( data.hasOwnProperty(prop) ){
            if ( first ) {
              text += this.underscore(prop);
              first = false;
            } else {
              text += `, ${this.underscore(prop)}`;
            }
            values.push(data[prop]);
          }
        }
        text += `) VALUES ${pg.valuesArray(values)} RETURNING *`;
        if ( Object.keys(approverEmployee).length === 0 ) return await pg.query(text, values);


        const client = await pg.pool.connect();
        const out = {res: [], err: false};
        try{
          await client.query('BEGIN');
          const approverType = await client.query(text, values);
          out.res.push(approverType);
          console.log("firstOut:", out);

          const approverTypeId = approverType.rows[0].approver_type_id;
          console.log("approverTypeId:", approverTypeId);

          for (const a of approverEmployee) {
            console.log("A:", a);
            console.log("ID:", approverTypeId);
            const approverText = `
            INSERT INTO approver_type_employee (approver_type_id, employee_kerberos, approval_order)
            VALUES ($1, $2, $3)
            RETURNING *
            `;
            const approverParams = [approverTypeId, a.employeeKerberos, a.approvalOrder];
            const r = await client.query(approverText, approverParams);
            out.res.push(r);
          }
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          out.err = error;
        } finally {
          client.release();
        }

        console.log("DB:",out);

        return out;
      

      }
    
      /**
       * @description Update the admin approver type table
       * @param {Object} data - approverType object including list of employees
       * use a transaction if changes are needed to the employee list
       * 
       * 
       * {
          "label": "label",
          "description": "descripton",
          "systemGenerated": false,
          "hideFromFundAssignment": false,
          "archived": false,
          "employees":{
            "employee_kerberos":"kerberos",
            "approval_order": 3
          }
         }
       * 
       * 
       * @returns {Object} {error: false}
       */
       async update(data){

        let id = data.approver_type_id;

        if ( data && Array.isArray(data) ) return pg.returnError('This takes only an ApproverType Object');
        if ( !data || Object.keys(data).length === 0 ) return pg.returnError('No data provided');

        if ( !id ) {
          return pg.returnError('id is required when updating approverType');
        }

        let approverEmployee = data.employees;

        const toUpdate = {};
        if ( data.label ) {
          toUpdate['label'] = data.label;
        }
        if ( data.description ) {
          toUpdate['description'] = data.description;
        }
        if ( data.systemGenerated ){
          toUpdate['system_generated'] = data.systemGenerated;
        }
        if ( data.hideFromFundAssignment ){
          toUpdate['hide_from_fund_assignment'] = data.hideFromFundAssignment;
        }
        if ( data.archived ){
          toUpdate['archived'] = data.archived;
        }
        if ( !Object.keys(toUpdate).length ){
          return pg.returnError('no valid fields to update');
        }

        const updateClause = pg.toUpdateClause(toUpdate);
        const text = `
        UPDATE approver_type SET ${updateClause.sql}
        WHERE approver_type_id = $${updateClause.values.length + 1}
        RETURNING *
        `;

        if ( Object.keys(approverEmployee).length === 0 ) return await pg.query(text, [...updateClause.values, id]);

        const client = await pg.pool.connect();
        const out = {res: [], err: false};
        try{
          await client.query('BEGIN');
          const approverType = await client.query(text, [...updateClause.values, id]);

          out.res.push(approverType);
          const approverTypeId = approverType.rows[0].approver_type_id;
          for (const a of approverEmployee) {
            const toEmployeeUpdate = {};
            if ( approverTypeId ) {
              toEmployeeUpdate['approver_type_id'] = approverTypeId;
            }
            if ( a.employeeKerberos ) {
              toEmployeeUpdate['employee_kerberos'] = a.employeeKerberos;
            }
            if ( a.approvalOrder ){
              toEmployeeUpdate['approval_order'] = a.approvalOrder;
            }
            if ( !Object.keys(toEmployeeUpdate).length ){
              return pg.returnError('no valid fields to update');
            }


            const updateEmployeeClause = pg.toUpdateClause(toEmployeeUpdate);

            const approverEmployeeText = `
            UPDATE approver_type_employee SET ${updateEmployeeClause.sql}
            WHERE approver_type_id = $${updateEmployeeClause.values.length + 1}
            RETURNING *
            `;
            
            const r = await client.query(approverEmployeeText, [...updateEmployeeClause.values, id]);
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
