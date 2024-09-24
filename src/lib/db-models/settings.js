import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";

/**
 * @class Settings
 * @description Model for settings table where application settings are stored such as custom html to display on a page
 */
class Settings {

  constructor(){
    this.entityFields = new EntityFields([
      {dbName: 'settings_id', jsonName: 'settingsId'},
      {dbName: 'key', jsonName: 'key'},
      {dbName: 'value', jsonName: 'value', userEditable: true},
      {dbName: 'label', jsonName: 'label'},
      {dbName: 'description', jsonName: 'description'},
      {dbName: 'default_value', jsonName: 'defaultValue'},
      {dbName: 'use_default_value', jsonName: 'useDefaultValue', userEditable: true},
      {dbName: 'keywords', jsonName: 'keywords'},
      {dbName: 'settings_page_order', jsonName: 'settingsPageOrder'},
      {dbName: 'input_type', jsonName: 'inputType'},
      {dbName: 'categories', jsonName: 'categories'},
      {dbName: 'can_be_html', jsonName: 'canBeHtml'}
    ]);
  }

  /**
   * @description Get settings object by key
   * @param {String} key - key of the setting
   * @param {Boolean} single - return single object or array
   * @returns {Object|Array}
   */
  async getByKey(key, single=true){
    const res = await pg.query(`SELECT * FROM settings WHERE key = $1`, [key]);
    if( res.error ) return res;
    const data = this.entityFields.toJsonArray(res.res.rows);
    if( single ) {
      return data[0] || null;
    }
    return data;
  }

  /**
   * @description Get settings value by key
   * @param {String} key - key of the setting
   * @param {*} defaultValue - default value to return if setting not found
   * @param {Boolean} suppressError - if true, return defaultValue if setting not found
   * @returns {Object|String}
   */
  async getValue(key, defaultValue=null, suppressError=false){
    const res = await this.getByKey(key);
    if( res.error ) {
      if ( suppressError ) return defaultValue;
      return res;
    }
    if ( !res ) return defaultValue;

    if ( res.useDefaultValue ) {
      return res.defaultValue;
    }
    return res.value;
  }

  /**
   * @description Get settings objects by category
   * @param {String} categories - category of the setting
   * if multiple categories are provided, settings with any of the categories will be returned
   * @returns {Array}
   */
  async getByCategory(...categories){
    const res = await pg.query(`SELECT * FROM settings WHERE categories && $1`, [categories]);
    if( res.error ) return res;
    return this.entityFields.toJsonArray(res.res.rows);
  }

  /**
   * @description Update an array of settings as a single transaction
   * @param {Array} settings - array of settings objects. only userEditable fields will be updated
   * @returns {Object} {error: false}
   */
  async updateSettings(settings){
    if ( settings && !Array.isArray(settings) ) settings = [settings];
    if ( !settings || !settings.length ) return pg.returnError('No settings provided');

    const out = {error: false};
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');
      for( const setting of settings ){
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

export default new Settings();
