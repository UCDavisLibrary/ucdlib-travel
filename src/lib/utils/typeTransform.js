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

}

export default new TypeTransform();
