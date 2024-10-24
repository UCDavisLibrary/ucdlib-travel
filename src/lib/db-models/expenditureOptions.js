import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";

/**
 * @class ExpenditureOptions
 * @description Model for expenditure_option table where options for line item expenditures are stored
 */
class ExpenditureOptions {

  constructor(){
    this.entityFields = new EntityFields([
      {dbName: 'expenditure_option_id', jsonName: 'expenditureOptionId', required: true},
      {
        dbName: 'label',
        jsonName: 'label',
        label: 'Label',
        required: true,
        charLimit: 50
      },
      {dbName: 'description', jsonName: 'description'},
      {dbName: 'form_order', jsonName: 'formOrder', validateType: 'integer'},
      {dbName: 'archived', jsonName: 'archived'}
    ]);
  }

  /**
   * @description Get all expenditure options
   * @param {Object} kwargs - optional arguments including:
   * - active: boolean - if true, return only active (non-archived) options
   * - archived: boolean - if true, return only archived options
   * @returns {Object|Array} - array of expenditure option objects or error object
   */
  async get(kwargs={}){
    let query = `SELECT * FROM expenditure_option WHERE 1=1`;
    if( kwargs.active ) {
      query += ` AND archived = false`;
    } else if( kwargs.archived ) {
      query += ` AND archived = true`;
    }
    query += ` ORDER BY form_order`;
    const res = await pg.query(query);
    if( res.error ) return res;
    return this.entityFields.toJsonArray(res.res.rows);
  }

  /**
   * @description Create a new expenditure option
   * @param {Object} data - new expenditure option data - camelCase keys
   * @returns {Object} - new expenditure option object or error object
   */
  async create(data){
    data = this.entityFields.toDbObj(data);
    const validation = await this.entityFields.validate(data, ['expenditure_option_id']);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }
    delete data.expenditure_option_id;
    data = pg.prepareObjectForInsert(data);
    const sql = `INSERT INTO expenditure_option (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING *`;
    const res = await pg.query(sql, data.values);
    if( res.error ) return res;
    return this.entityFields.toJsonObj(res.res.rows[0]);
  }

  /**
   * @description Update an expenditure option
   * @param {Object} data - expenditure option data - camelCase keys
   * @returns {Object} - updated expenditure option object or error object
   */
  async update(data){
    data = this.entityFields.toDbObj(data);
    const validation = await this.entityFields.validate(data);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }
    const id = data.expenditure_option_id;
    delete data.expenditure_option_id;

    const updateClause = pg.toUpdateClause(data);
    const sql = `
      UPDATE expenditure_option
      SET ${updateClause.sql}
      WHERE expenditure_option_id = $${updateClause.values.length + 1}
      RETURNING *
    `;
    const res = await pg.query(sql, [...updateClause.values, id]);
    if( res.error ) return res;
    return this.entityFields.toJsonObj(res.res.rows[0]);
  }

}

export default new ExpenditureOptions();
