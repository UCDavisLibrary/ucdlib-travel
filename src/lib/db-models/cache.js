import pg from "./pg.js";

/**
 * @description Model for accessing the cache table
 */
class Cache {

  /**
   * @description Set a cache value
   * @param {String} type - Arbitrary cache category type, e.g. 'accessToken'
   * @param {String} query - Identifier for cache value of a category, e.g. 'user:1234'
   * @param {*} data - Data to cache - must be JSON serializable
   * @returns {Object} {res, error}
   */
  async set(type, query, data){
    let text = `
      INSERT INTO cache (type, query, data)
      VALUES ($1, $2, $3)
      ON CONFLICT (type, query) DO UPDATE SET data = $3, created = NOW()
    `;
    return await pg.query(text, [type, query, data]);
  }

  /**
   * @description Get a cached value
   * @param {String} type - Arbitrary cache category type, e.g. 'accessToken'
   * @param {String} query - Identifier for cache value of a category, e.g. 'user:1234'
   * @param {String} expiration - Postgres interval string, e.g. '1 hour'
   * @returns
   */
  async get(type, query, expiration){
    let text = `
      SELECT * FROM cache
      WHERE type = $1 AND query = $2
    `;
    const params = [type, query];
    if ( expiration ) {
      text += ` AND created > NOW() - INTERVAL '${expiration}'`;
    }
    return await pg.query(text, params);
  }

  /**
   * @description Delete a cached value
   * @param {String} type - Arbitrary cache category type, e.g. 'accessToken'
   * @param {String} query - Identifier for cache value of a category, e.g. 'user:1234'
   * @returns
   */
  async delete(type, query){
    let text = `
      DELETE FROM cache
      WHERE type = $1 AND query = $2
    `;
    return await pg.query(text, [type, query]);
  }
}

export default new Cache();
