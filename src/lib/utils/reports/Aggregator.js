/**
 * @description Class for a report metric
 */
class Aggregator {

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
    return `aggregator_${this.value}_description`;
  }

  get urlParam() {
    return this.data.urlParam || this.value;
  }

  get reportColumn() {
    return this.data.reportColumn || `agg_${this.value.toLowerCase()}`;
  }
}

export default Aggregator;
