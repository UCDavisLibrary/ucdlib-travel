/**
 * @class EntityFields
 * @description Used to define fields of an entity (usually a database table)
 * @param {Array} fields - array of field objects with the following properties:
 * - dbName {String} - name of the field in the database (should be snake_case)
 * - jsonName {String} - name of the field in JSON responses (should be camelCase)
 */
export default class EntityFields {
   constructor(fields = []){
      this.fields = fields;
   }

   /**
    * @description Convert an object with database field names to an object with JSON field names
    * @param {Object} obj - object with database field names
    * @returns {Object}
    */
   toJsonObj(obj={}) {
    const out = {};

    this.fields.forEach(field => {
      if ( !field.jsonName || !field.dbName || !obj.hasOwnProperty(field.dbName) ) return;
      out[field.jsonName] = obj[field.dbName];
    });

    return out;
   }

   /**
    * @description Convert an array of objects with database field names to an array of objects with JSON field names
    * @param {Array} arr - array of objects with database field names
    * @returns {Array}
    */
   toJsonArray(arr=[]) {
    return arr.map(obj => this.toJsonObj(obj));
   }

   /**
    * @description Convert an object with JSON field names to an object with database field names
    * @param {Object} obj - object with JSON field names
    * @returns {Object}
    */
   toDbObj(obj={}) {
    const out = {};

    this.fields.forEach(field => {
      if ( !field.jsonName || !field.dbName || !obj.hasOwnProperty(field.jsonName) ) return;
      out[field.dbName] = obj[field.jsonName];
    });

    return out;
   }

   /**
    * @description Convert an array of objects with json field names to an array of objects with database field names
    * @param {Array} arr - array of objects with JSON field names
    */
   toDbArray(arr=[]) {
    return arr.map(obj => this.toDbObj(obj));
   }
}
