class ObjectUtils {

  /**
   * @description Check if two key-value objects are equal
   * @param {Object} a - first object
   * @param {Object} b - second object
   * @returns {Boolean}
   */
  objectsAreEqual(a, b) {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (let i = 0; i < aKeys.length; i++) {
      if (aKeys[i] !== bKeys[i] || a[aKeys[i]] !== b[bKeys[i]]) {
        return false;
      }
    }

    return true;
  }

  /**
   * @description Check if two objects have the same keys
   * @param {Object} a - first object
   * @param {Object} b - second object
   * @returns {Boolean}
   */
  objectsHaveSameKeys(a, b) {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (let i = 0; i < aKeys.length; i++) {
      if (aKeys[i] !== bKeys[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * @description Return the sum of the values of an object, skip if value is not a number
   * @param {Object} obj - object to sum values of
   * @returns {Number}
   */
  sumObjectValues(obj) {
    return Object.values(obj).reduce((acc, val) => {
      if (typeof val === 'number') {
        acc += val;
      }
      return acc;
    }, 0);
  }

  /**
   * @description Check if an object is empty
   * @param {Object} obj - object to check
   * @returns {Boolean}
   */
  objectIsEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

}

export default new ObjectUtils();
