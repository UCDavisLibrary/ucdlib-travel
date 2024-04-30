import cache from "./cache.js";
import pg from "./pg.js";

/**
 * @class Approver Type
 * @description Class for querying data about approver information
 */
class ApproverType {


    constructor(){
        this.entityFields = new EntityFields([
          {dbName: 'approver_type_id', jsonName: 'approverTypeId'},
          {dbName: 'label', jsonName: 'label'},
          {dbName: 'description', jsonName: 'description', userEditable: true},
          {dbName: 'system_generated', jsonName: 'systemGenerated'},
          {dbName: 'description', jsonName: 'description'},
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
      async query(args={}){
        let res;
        let archived = "f";

        if(args.archived == true) archived = "t";
        
        if(Array.isArray(args.id)) {
            let v = pg.valuesArray(args.id);
            res = await pg.query(`SELECT * FROM approver_type WHERE approver_type_id in $1 AND archived=$2`, [v, archived]);

        } else {
            res = await pg.query(`SELECT * FROM approver_type WHERE approver_type_id in $1 AND archived=$2`, [args.id, archived]);
        }

        if( res.error ) return res;
        const data = this.entityFields.toJsonArray(res.res.rows);
        if( single ) {
          return data[0] || null;
        }
        return data;
      }
    
      /**
       * @description Create the approver type table
       * @param {Object} data - approverType object including list of employees
       * @returns {Object} {error: false}
       */
       async create(data){
        let text = `
          INSERT INTO approver_type (type, query, data)
          VALUES ($1, $2, $3)
          ON CONFLICT (type, query) DO UPDATE SET data = $3, created = NOW()
        `;

        const res = await pg.query(`SELECT * FROM settings WHERE categories && $1`, [categories]);
        if( res.error ) return res;
        return this.entityFields.toJsonArray(res.res.rows);
      }
    
      /**
       * @description Update the approver type table
       * @param {Object} data - approverType object including list of employees
       * use a transaction if changes are needed to the employee list
       * @returns {Object} {error: false}
       */
       async update(data){

        {
          
          employees:{}
        }
        
        if ( data && !Array.isArray(data) ) data = [data];
        if ( !data || !data.length ) return pg.returnError('No data provided');
    
        const out = {error: false};
        const client = await pg.pool.connect();
        try {
          await client.query('BEGIN');
          for( const setting of data ){
            let sql = 'UPDATE settings SET ';
            const valueMap = {}
            for( const field of this.entityFields.fields ){
              if ( !field.userEditable ) continue;
              if ( setting.hasOwnProperty(field.jsonName) ) {
                valueMap[field.dbName] = setting[field.jsonName];
              }
            }
            if ( Object.keys(valueMap).length === 0 ) {
              // no user editable fields provided, skip this setting
              continue;
            }
            const updateClause = pg.toUpdateClause(valueMap);
            sql += `${updateClause.sql} WHERE settings_id = $${updateClause.values.length + 1}`;
            const values = [...updateClause.values, setting.settingsId];
            await client.query(sql, values);
          }
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          out.error = error;
        } finally {
          client.release();
        }
        return out;
    
      }
    }

export default new ApproverType();
