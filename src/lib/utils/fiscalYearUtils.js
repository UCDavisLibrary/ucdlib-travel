const fiscalYearStartMonth = 6; // July

/**
 * @description Utility class for working with academic fiscal years
 */
class FiscalYearUtils {

  constructor(){
    this.fiscalYearStartMonth = fiscalYearStartMonth;
  }

  /**
   * @description Get the current fiscal year from a date
   * @param {Date|String} date - Date object or iso string. If empty, uses today's date
   * @param {Object} kwargs - Optional arguments, including:
   * @param {Boolean} kwargs.UTC - If true, use UTC date to calculate the fiscal year
   * @returns {FiscalYear} - The fiscal year
   */
  fromDate(date, kwargs={}){
    let UTC = kwargs.UTC || false;

    ({date, UTC} = this._parseDate(date, UTC));
    this._isDate(date, true);

    let year = UTC ? date.getUTCFullYear() : date.getFullYear();
    let month = UTC ? date.getUTCMonth() : date.getMonth();

    if(month < this.fiscalYearStartMonth){
      year--;
    }

    return new FiscalYear(year);
  }

  /**
   * @description Get the current fiscal year
   * @returns {FiscalYear} - The current fiscal year
   */
  current(){
    return this.fromDate();
  }

  /**
   * @description Get the fiscal year from a start year
   * @param {Number} startYear - The start year of the fiscal year
   * @param {Boolean} suppressError - If true, return null instead of throwing an error
   * @returns
   */
  fromStartYear(startYear, suppressError=false){
    startYear = Number(startYear);
    if (isNaN(startYear) || startYear < 0) {
      if (suppressError) return null;
      throw new Error('Invalid start year');
    }

    return new FiscalYear(startYear);
  }

  /**
   * @description Get a list of fiscal years from a list
   * @param {Array} startYears - An array of start years
   * @param {String} order - The order of the fiscal years - 'asc' or 'desc'
   * @returns {Array} - An array of fiscal year objects
   */
  fromStartYears(startYears, order='asc'){
    const out = [];
    if ( !Array.isArray(startYears) ) return out;
    startYears = startYears.map(Number).filter(year => !isNaN(year) && year >= 0);
    startYears = [...new Set(startYears)].sort((a, b) => order === 'asc' ? a - b : b - a);
    startYears.forEach(year => out.push(new FiscalYear(year)));
    return out;
  }

  /**
   * @description Get a range of fiscal years relative to a date
   * @param {Date|String} date - Date object or iso string. If empty, uses today's date
   * @param {Number} yearsAhead - Number of years ahead of date's FY to include in the range
   * @param {Number} yearsBefore - Number of years before date's FY to include in the range
   * @param {Object} kwargs - Optional arguments, including:
   * @param {Boolean} kwargs.UTC - If true, use UTC date to calculate the fiscal year
   * @returns {Array} - An array of fiscal years
   */
  getRangeFromDate(date, yearsAhead=1, yearsBefore=0, kwargs={}){
    let UTC = kwargs.UTC || false;

    ({date, UTC} = this._parseDate(date, UTC));
    this._isDate(date, true);

    const range = [];
    range.push(this.fromDate(date, {UTC}));

    for(let i=0; i<yearsBefore; i++){
      range.unshift( range[0].previous() );
    }

    for(let i=0; i<yearsAhead; i++){
      range.push( range[range.length-1].next() );
    }
    return range;
  }

  /**
   * @description Parse a date argument
   * @param {*} date - The date to parse - can be a Date object, a string, or empty
   * @param {Boolean} UTC - If true, date will be in UTC
   * @returns {Object} - The date and UTC flag
   */
  _parseDate(date, UTC){

    if (typeof date === 'string') {
      if (!date.includes('T')) {
        date = date + 'T00:00:00';
      }
      if ( UTC && !date.endsWith('Z') ) {
        date = date + 'Z';
      }
      date = new Date(date);
    } else if ( !date ) {
      date = new Date();
      UTC = false;
    }

    return {date, UTC};
  }

  /**
   * @description Check if is a valid date
   * @param {*} date - The date to check
   * @param {Boolean} throwException - If true, throw an exception if the date is invalid
   * @returns {Boolean} - True if the date is valid, false otherwise
   */
  _isDate(date, throwException=false){
    let isDate = date instanceof Date;
    isDate = isDate && !isNaN(date.valueOf());
    if(throwException && !isDate){
      throw new Error('Invalid date');
    }
    return isDate;
  }

}

/**
 * @description Class representing a fiscal year
 * @param {Number} startYear - The start year of the fiscal year
 */
class FiscalYear {
  constructor(startYear){
    this.fiscalYearStartMonth = fiscalYearStartMonth;
    this.startYear = Number(startYear);
    this.endYear = this.startYear + 1;
    this.label = `${this.startYear}-${this.endYear}`;
    this.labelShort = `${this.startYear}-${String(this.endYear).slice(2)}`;
  }

  toString(){
    return this.label;
  }

  /**
   * @description Get the start date of the fiscal year
   * @param {Object} kwargs - Optional arguments, including:
   * @param {Boolean} kwargs.UTC - If true, date will be in UTC
   * @param {Boolean} kwargs.isoDate - If true, date will be in ISO format - YYYY-MM-DD
   * @returns {Date|String} - The start date of the fiscal year
   */
  startDate(kwargs={}){
    return this._getDate(this.startYear, this.fiscalYearStartMonth, 1, kwargs);
  }

  /**
   * @description Get the end date of the fiscal year
   * @param {Object} kwargs - Optional arguments, including:
   * @param {Boolean} kwargs.UTC - If true, date will be in UTC
   * @param {Boolean} kwargs.isoDate - If true, date will be in ISO format - YYYY-MM-DD
   * @returns {Date|String} - The end date of the fiscal year
  */
  endDate(kwargs={}){
    return this._getDate(this.endYear, this.fiscalYearStartMonth, 0, kwargs);
  }

  /**
   * @description Get a date from year, month, and day
   * @param {Number} year
   * @param {Number} month
   * @param {Number} day
   * @param {Object} kwargs - Optional arguments. See startDate and endDate methods for details
   * @returns {Date|String} - The date
   */
  _getDate(year, month, day, kwargs={}){
    const UTC = kwargs.UTC || false;
    const isoDate = kwargs.isoDate || false;
    const date = UTC ? new Date(Date.UTC(year, month, day)) : new Date(year, month, day);
    if ( !isoDate ) {
      return date;
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * @description Get the next fiscal year
   * @returns {FiscalYear} - The next fiscal year
   */
  next(){
    return new FiscalYear(this.startYear + 1);
  }

  /**
   * @description Get the previous fiscal year
   * @returns {FiscalYear} - The previous fiscal year
   */
  previous(){
    return new FiscalYear(this.startYear - 1);
  }
}

export default new FiscalYearUtils();
