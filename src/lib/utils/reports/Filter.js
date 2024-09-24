class Filter {
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
    return `filter_${this.value}_description`;
  }

  get urlParam() {
    const d = this.data.urlParam || this.value;
    return `filter-${d}`;
  }

  get isInt() {
    return this.data.isInt || false;
  }

}

export default Filter
