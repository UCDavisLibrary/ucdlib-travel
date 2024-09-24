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

  /**
   * @description Filter an array of objects to remove duplicates based on a key
   * @param {Array} arr - array of objects
   * @param {String} key - key to filter by
   * @returns {Array}
   */
  uniqueArray(arr, key) {
    arr = arr.filter((item) => item?.[key] !== undefined);
    return arr.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t[key] === item[key]
      ))
    );
  }

  /**
   * @description Sum the values of an array of objects based on a key
   * @param {Array} arr - array of objects
   * @param {String} key - key to sum by
   * @returns {Number}
   */
  sumArray(arr, key){
    return arr.reduce((acc, item) => {
      let n = Number(item[key]);
      if (isNaN(n)) return acc;
      acc += item[key];
      return acc;
    }, 0);
  }

  /**
   * @description Chunk an array into smaller arrays of a specified size
   * @param {Array} arr - array to chunk
   * @param {Integer} size - size of chunks
   * @returns {Array}
   */
  chunkArray(arr, size) {
    return arr.reduce((acc, _, i) => {
      if (i % size === 0) {
        acc.push(arr.slice(i, i + size));
      }
      return acc;
    }, []);
  }

}

export default new ObjectUtils();
