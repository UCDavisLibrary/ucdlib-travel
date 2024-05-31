class PromiseUtils {


  /**
   * @description Flatten an array of promises from Promise.allSettled
   * e.g. if one of the array elements is also an array from a Promise.allSettled call
   * @param {Array} resolvedPromises - array of promises from Promise.allSettled
   * @returns {Array} - flattened array of promises
   */
  flattenAllSettledResults(resolvedPromises){
    const out = [];
    resolvedPromises.forEach(p => {
      if ( Array.isArray(p.value) ) {
        out.push(...p.value);
      } else {
        out.push(p);
      }
    });
    return out;
  }

  /**
   * @description Check if any of the promises have an error - either rejected or cork-app-utils error state
   * @param {Array} promises
   * @returns {Boolean}
   */
  hasError(promises){
    return promises.some(e => e.status === 'rejected' || e.value.state === 'error');
  }

}

export default new PromiseUtils();
