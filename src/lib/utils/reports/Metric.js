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
}

export default Metric;
