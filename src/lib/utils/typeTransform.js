/**
 * @class TypeTransform
 * @description Transform/validation functions for types
 */
class TypeTransform {

  /**
   * @description Convert value to a positive integer
   * @param {*} value - value to convert
   * @param {Boolean} convertFloat - if value is a float, convert to int - otherwise, return null
   * @returns {Number|null} - positive integer or null
   */
  toPositiveInt(value, convertFloat = false) {
    if ( convertFloat ) {
      value = parseInt(value);
    } else {
      value = Number(value);
    }

    if (
      isNaN(value) ||
      value < 1 ||
      !Number.isInteger(value)
    ) {
      return null;
    }

    return value;
  }

  /**
   * @description Convert value to a positive number
   * @param {*} value - value to convert
   * @returns {Number|null}
   */
  toPositiveNumber(value) {
    value = Number(value);
    if ( isNaN(value) || value < 0 ) {
      return null;
    }
    return value;
  }

  /**
   * @description Convert YYYY-MM-DD date string to Date object
   * @param {String} value - date string
   * @returns {Date|null}
   */
  toDateFromISO(value) {
    if ( !value ) return null;
    value = value.toString();
    if ( value.includes('T') ) {
      value = value.split('T')[0];
    }
    if ( !value.match(/^\d{4}-\d{2}-\d{2}$/) ) {
      return null;
    }
    const date = new Date(value);
    if ( isNaN(date.getTime()) ) {
      return null;
    }
    return date;
  }

  /**
   * @description Convert Date object to UTC formatted string
   * @param {Date} date
   * @returns {String}
   */
  toUtcString(date){
    if (!(date instanceof Date)) {
      return '';
    }

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year = date.getUTCFullYear();
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();

    return `${month} ${day}, ${year}`;
  }

  /**
   * @description Return a formatted date string
   * @param {String} timestamp - ISO date string
   * @returns {String}
   */
  toLocaleDateTimeString(timestamp){
    if ( !timestamp ) return '';
    let date = new Date(timestamp.endsWith('Z') ? timestamp : timestamp + 'Z');
    let dateString = date.toLocaleDateString();
    let timeString = date.toLocaleTimeString();
    return `${dateString} ${timeString}`;
  }

  /**
   * @description Convert an array to key-value object
   * @param {Array} arr - array to convert
   * @param {Function} keyFunc - function to get key from array item, will be passed the item
   * @param {Function} valFunc - function to get value from array item, will be passed the item
   * @returns {Object} - key-value object
   */
  arrayToObject(arr, keyFunc, valFunc){
    const obj = {};
    arr.forEach((item) => {
      obj[keyFunc(item)] = valFunc(item);
    });
    return obj;
  }

  /**
   * @description Convert 2 iso date strings to a date range string
   * @param {String} date1 - YYYY-MM-DD date string
   * @param {String} date2 - YYYY-MM-DD date string
   * @returns {String}
   */
  dateRangeFromIsoString(date1, date2){
    const startDate = this.toDateFromISO(date1);
    const endDate = this.toDateFromISO(date2);

    if ( !startDate ) return '';

    if ( !endDate || startDate.getTime() === endDate.getTime() ) {
      return this.toUtcString(startDate);
    }

    return `${this.toUtcString(startDate)} - ${this.toUtcString(endDate)}`;

  }

  /**
   * @description Parse a string as JSON
   * @param {String} data - JSON string
   * @param {*} defaultData - default data to return if parsing fails, defaults to empty object
   * @returns
   */
  parseJsonString(data, defaultData = {}){
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = defaultData;
    }
    return parsedData;
  }

  /**
   * @description Convert a number to a dollar string in the format '0.00'
   * @param {Number} num - number to convert
   * @returns {String}
   */
  toDollarString(num){
    num = Number(num);
    if ( isNaN(num) ) return '0.00';
    return num.toFixed(2);
  }

}

export default new TypeTransform();
