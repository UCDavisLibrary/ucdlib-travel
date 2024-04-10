import pg from 'pg';
const pool = new pg.Pool();

/**
 * @description Utility Wrapper around pg library
 */
class Pg {
  constructor() {
    this.pool = pool;
  }

  get output(){
    return {res: false, error: false};
  }

  /**
   * @description https://node-postgres.com/features/queries
   * @param {String} text - SQL
   * @param {Array} values - Hydration values
   * @returns {Object} {res, err}
   */
  async query(text, values){
    const out = this.output;
    try {
      out.res = await pool.query(text, values);
    } catch (error) {
      out.error = error;
    }
    return out;
  }

  /**
   * @description Return a formatted error response
   * @param {String} message - Error message
   * @returns {Object}
   */
  returnError(message){
    const out = {...this.output};
    out.error = {};
    if ( message ) out.error.message = message;
    return out;
  }

  /**
   * @description Constructs Values array for INSERT statement given a list of values for hydration
   * @param {Array} values - List of values to sub into insert statement
   * @returns {String} ($1, $2, $3), etc
   */
  valuesArray(values){
    return `(${values.map((v, i) => `$${i + 1}`).join(', ')})`;
  }

  /**
   * @description Converts an object to parameters of a WHERE clause
   * @param {Object} queryObject - key value pairs for clause
   * @param {Boolean} useOr - Use OR instead of AND
   * @returns {Object} {sql: 'foo = $1 AND bar = $2', values: ['fooValue', 'barValue]}
   */
  toWhereClause(queryObject, useOr=false){
    return this._toEqualsClause(queryObject, useOr ? ' OR ' : ' AND ');
  }

  /**
   * @description Converts an object to parameters of a UPDATE clause
   * @param {Object} queryObject - key value pairs for clause
   * @param {Boolean} underscore - Convert keys to underscore
   * @returns {Object} {sql: 'foo = $1, bar = $2', values: ['fooValue', 'barValue]}
   */
  toUpdateClause(queryObject){
    return this._toEqualsClause(queryObject, ', ');
  }

  _toEqualsClause(queryObject, sep=' AND '){
    let sql = '';
    const values = [];
    if ( queryObject && typeof queryObject === 'object' ){
      for (const [i, k] of (Object.keys(queryObject)).entries()) {
        values.push(queryObject[k]);
        sql += `${i > 0 ? sep : ''}${k}=$${i+1}`;
      }
    }
    return {sql, values};
  }
}

export default new Pg();
