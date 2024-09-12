import typeTransform from "../typeTransform.js";

/**
 * @description Class for a report metric
 */
class Metric {

  constructor(data){
    this.data = data;
  }

  toString(){
    return this.label;
  }

  get value() {
    return this.data.value || '';
  }

  get label() {
    return this.data.label || '';
  }

  get shortLabel() {
    return this.data.shortLabel || this.label;
  }

  get descriptionSettingKey() {
    return `metric_${this.value}_description`;
  }

  get urlParam() {
    return this.data.urlParam || this.value;
  }

  get reportsRequired() {
    return this.data.reportsRequired || [];
  }

  get isMonetary() {
    return this.data.isMonetary ? true : false;
  }

  /**
   * @description Perform the calculation for a metric given individual report values
   * @param  {...any} reportValues - The individual report values - corresponding to the reportsRequired array
   * @returns {Number}
   */
  doReportsCalculation(...reportValues) {
    reportValues = reportValues.map(report => typeTransform.toNumberOrZero(report));
    if ( !this.data.reportsCalculation ){
      return reportValues[0] || 0;
    }
    // append 0s to the end of the array if there are not enough values
    while ( reportValues.length < this.reportsRequired.length ){
      reportValues.push(0);
    }
    return this.data.reportsCalculation(...reportValues);
  }
}

export default Metric;
