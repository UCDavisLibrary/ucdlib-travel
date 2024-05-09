/**
 * @class EntityFields
 * @description Used to define fields of an entity (usually a database table)
 * @param {Array} fields - array of field objects with the following properties:
 * - dbName {String} REQUIRED - name of the field in the database (should be snake_case)
 * - jsonName {String} REQUIRED - name of the field in JSON responses (should be camelCase)
 * - label {String} OPTIONAL - human readable label for the field
 * - required {Boolean} OPTIONAL - if the field is required
 * - charLimit {Number} OPTIONAL - maximum number of characters allowed
 * - customValidation {Function} OPTIONAL - custom validation function
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
    if ( typeof obj !== 'object' || Array.isArray(obj) ) return {};
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
    if ( typeof obj !== 'object' || Array.isArray(obj) ) return {};

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

   /**
    * @description Validate a record against the fields defined in this class
    * @param {Object} record - object to validate
    * @param {String} namingScheme - Schema of record keys: 'dbName' or 'jsonName'
    * @param {Array} skipFields - array of field names to skip validation on
    * @returns {Object} - {valid: Boolean, fieldsWithErrors: Array}
    * Where fieldsWithErrors is an array of objects with the following properties:
    * - All properties of the field object
    * - errors {Array} - array of error objects with the following properties:
    *  - errorType {String} - type of error
    *  - message {String} - human readable error message for printing on a form
    */
   validate(record, skipFields=[], namingScheme='dbName') {
    const out = {valid: true, fieldsWithErrors: []};

    for (const field of this.fields) {
      if ( skipFields.includes(field[namingScheme]) ) continue;
      const value = record[field[namingScheme]];
      this._validateRequired(field, value, out);
      this._validateCharLimit(field, value, out);
      this._validateType(field, value, out);
    }

    for (const field of this.fields) {
      if ( skipFields.includes(field[namingScheme]) ) continue;
      const value = record[field[namingScheme]];
      if ( field.customValidation ) {
        field.customValidation(field, value, out, record);
      }
    }

    return out;
   }

   /**
    * @description Validate that a field is not empty
    * @param {Object} field - field object
    * @param {Any} value - value to validate
    * @param {Object} out - output object from validate method
    */
   _validateRequired(field, value, out) {
    if ( !field.required ) return;
    const error = {errorType: 'required', message: 'This field is required'};
    if ( value === undefined || value === null || value === '') {
      out.valid = false;
      this.pushError(out, field, error);
    }
   }

   /**
    * @description Validate that a field does not exceed the character limit
    * @param {Object} field - field object
    * @param {Any} value - value to validate
    * @param {Object} out - output object from validate method
    */
   _validateCharLimit(field, value, out) {
    if ( !field.charLimit ) return;
    value = value ? value.toString() : '';
    const error = {errorType: 'charLimit', message: `This field must be less than ${field.charLimit} characters`};
    if (value && value.length > field.charLimit) {
      out.valid = false;
      this.pushError(out, field, error);
    }
   }

   /**
    * @description Validate that a field can be cast to a certain type
    */
   _validateType(field, value, out) {
    if ( !field.validateType ) return;
    if ( value === undefined || value === null ) return;

    const error = {errorType: 'validateType', message: `This field must be of type: ${field.validateType}`};
    if (field.validateType == 'integer'  ) {
      value = value || value === '0' || value === 0 ? value : NaN;
      if ( !Number.isInteger(Number(value)) ) {
        out.valid = false;
        this.pushError(out, field, error);
      }
    } else if (field.validateType == 'date') {
      // must be valid date in format YYYY-MM-DD
      value = value.toString();
      if ( !value.match(/^\d{4}-\d{2}-\d{2}$/) ) {
        out.valid = false;
        this.pushError(out, field, error);
        return;
      }
      const date = new Date(value);
      if ( isNaN(date.getTime()) ) {
        out.valid = false;
        this.pushError(out, field, error);
      }
    }

   }

   /**
    * @description Add an error to the out array for given field
    * @param {Object} out - output object from validate method
    * @param {Object} field - field object
    * @param {Object} error - error object with errorType and message properties
    */
   pushError(out, field, error) {
    const fieldInOutput = out.fieldsWithErrors.find(f => f.jsonName === field.jsonName);
    if ( fieldInOutput ) {
      fieldInOutput.errors.push(error);
    } else {
      out.fieldsWithErrors.push({...field, errors: [error]});
    }
  }

  /**
   * @description Check if a field has an error in the output object
   * @param {Object} out - output object from validate method
   * @param {Object|String} field - field object or jsonName of field
   * @returns {Boolean}
   */
  fieldHasError(out, field) {
    if ( typeof field === 'string' ) {
      field = this.fields.find(f => f.jsonName === field);
    }
    return out.fieldsWithErrors.some(f => f.jsonName === field.jsonName);
  }
}
