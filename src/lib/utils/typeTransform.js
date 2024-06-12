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
   * @description Convert YYYY-MM-DD date string to Date object
   * @param {String} value - date string
   * @returns {Date|null}
   */
  toDateFromISO(value) {
    if ( !value ) return null;
    value = value.toString();
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

}

export default new TypeTransform();
