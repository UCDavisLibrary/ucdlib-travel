import pg from "../../db-models/pg.js";
import reportUtils from "./reportUtils.js";

class ReportSqlUtils {

  /**
   * @param {Object} columnMap - A map of the report filter/aggregator names to the column names in the database
   */
  constructor(columnMap={}){
    this.columnMap = columnMap;
    this.measureColumn = 'value';
  }

  /**
   * @description Parse the report filters and return a where clause
   * @param {Object} filters - The report filters where the key is the filter name and the value is the filter value
   * @param {Object} whereArgs - The where arguments to start with
   * @returns {Object} The where clause as an object with the following properties:
   * - sql: The SQL where clause
   * - values: The values to hydrate the where clause
   */
  parseFilters(filters, whereArgs={}){
    for ( const filter of reportUtils.filters ){
      if ( filters[filter.value]?.length && this.columnMap[filter.value] ){
        whereArgs[this.columnMap[filter.value]] = filters[filter.value];
      }
    }
    return pg.toWhereClause(whereArgs);
  }

  /**
   * @description Parse the report aggregators and return the group by and select clauses
   * @param {Object} aggregators - The report aggregators where the key is the axis and the value is the aggregator class
   * @returns {Object} The group by and select clauses as an object with the following properties:
   * - groupBy: The SQL group by clause
   * - select: The SQL select clause
   */
  parseAggregators(aggregators){
    aggregators = [aggregators.x, aggregators.y].filter(a => a);
    const out = {
      groupBy: [],
      select: []
    }
    for ( const aggregator of aggregators ){
      if ( !this.columnMap[aggregator.value] ) continue;
      out.groupBy.push(this.columnMap[aggregator.value]);
      out.select.push(`${this.columnMap[aggregator.value]} as ${aggregator.reportColumn}`);
    }

    out.groupBy = out.groupBy.join(', ');
    out.select = out.select.join(', ');
    return out;
  }

  prepareReportResults(results){
    return results.map(r => {
      r[this.measureColumn] = parseFloat(r[this.measureColumn]);
      return r;
    })
  }
}

export default ReportSqlUtils;
