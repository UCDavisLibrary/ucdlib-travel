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

  /**
   * @description Converts an object to parameters of an INSERT clause
   * @param {Object} obj - key value pairs for clause
   * @returns {Object} {keys: ['foo', 'bar'], values: ['fooValue', 'barValue'], placeholders: ['$1', '$2']}
   */
  prepareObjectForInsert(obj){
    const out = {keys: [], values: [], placeholders: []};
    for (const k in obj) {
      out.keys.push(k);
      out.values.push(obj[k]);
      out.placeholders.push(`$${out.values.length}`);
    }

    out.keysString = out.keys.join(', ');
    out.valuesString = out.values.join(', ');
    out.placeholdersString = out.placeholders.join(', ');
    return out;
  }

  _toEqualsClause(queryObject, sep=' AND ', indexStart=0){
    let sql = '';
    const values = [];
    if ( queryObject && typeof queryObject === 'object' ){
      let i = indexStart;
      for (const k of Object.keys(queryObject)) {
        // make an IN clause if the value is an array
        if ( Array.isArray(queryObject[k]) ){
          const inClause = queryObject[k].map((v, j) => `$${i + j + 1}`).join(', ');
          values.push(...queryObject[k]);
          sql += `${i > indexStart ? sep : ''}${k} IN (${inClause})`;
          i += queryObject[k].length;

        // if the value is an object with an operator key, use that operator
        } else if ( queryObject[k] && typeof queryObject[k] === 'object' && queryObject[k].operator && queryObject[k].value !== undefined){
          const operator = queryObject[k].operator;
          const value = queryObject[k].value;
          values.push(value);
          sql += `${i > indexStart ? sep : ''}${k} ${operator} $${i+1}`;
          i++;

        // if the value is an object without a value key, treat it as nested and recurse. check for relation key
        } else if ( queryObject[k] && typeof queryObject[k] === 'object' && queryObject[k].relation !== undefined ){
          const q = {...queryObject[k]};
          const relation = q.relation;
          delete q.relation;
          const nested = this._toEqualsClause(q, relation ? ` ${relation} ` : sep, i);
          values.push(...nested.values);
          sql += `${i > indexStart ? sep : ''}(${nested.sql})`;
          i += nested.values.length;

        // else make an equals clause
        } else {
          values.push(queryObject[k]);
          sql += `${i > indexStart ? sep : ''}${k}=$${i+1}`;
          i++;
        }
      }
    }
    return {sql, values};
  }
}

export default new Pg();
