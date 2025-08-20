import Metric from './Metric.js';
import Aggregator from './Aggregator.js';
import Filter from './Filter.js';

/**
 * @description Isomorphic utility functions for reports
 */
class ReportUtils {

  get metrics() {
    const metrics = [
      {
        label: 'Amount Allocated',
        shortLabel: 'Allocated',
        value: 'allocated',
        isDefault: false,
        isMonetary: true,
        reportsRequired: ['allocated']
      },
      {
        label: 'Amount Requested',
        shortLabel: 'Requested',
        value: 'requested',
        isDefault: true,
        isMonetary: true,
        reportsRequired: ['requested']
      },
      {
        label: 'Amount Requested or Reimbursed',
        shortLabel: 'Requested/Reimbursed',
        value: 'requestedOrReimbursed',
        urlParam: 'requested-or-reimbursed',
        isMonetary: true,
        reportsRequired: ['requestedNotReimbursed', 'fullyReimbursed'],
        reportsCalculation: (...reports) => reports[0] + reports[1]
      },
      {
        label: 'Amount Allocated Minus Requested',
        shortLabel: 'Allocated - Requested',
        value: 'allocatedMinusRequested',
        urlParam: 'allocated-minus-requested',
        isMonetary: true,
        reportsRequired: ['allocated', 'requested'],
        reportsCalculation: (...reports) => reports[0] - reports[1]
      },
      {
        label: 'Amount Allocated Minus Requested or Reimbursed',
        shortLabel: 'Allocated - Requested/Reimbursed',
        value: 'allocatedMinusRequestedOrReimbursed',
        urlParam: 'allocated-minus-requested-or-reimbursed',
        isMonetary: true,
        reportsRequired: ['allocated', 'requestedNotReimbursed', 'fullyReimbursed'],
        reportsCalculation: (...reports) => reports[0] - (reports[1] + reports[2])
      },
      {
        label: 'Release Time (Hours)',
        shortLabel: 'Release Time',
        value: 'releaseTime',
        urlParam: 'release-time',
        reportsRequired: ['releaseTime']
      }
    ];
    return metrics.map(data => new Metric(data));
  }

  /**
   * @description Get default metrics for the client
   * @param {Boolean} returnValue - if true, only return the values, otherwise return the Metric objects
   * @returns {Array}
   */
  defaultMetrics(returnValue) {
    const defaultMetrics = this.metrics.filter(metric => metric.data.isDefault);
    if ( returnValue ){
      return defaultMetrics.map(metric => metric.value);
    } else {
      return defaultMetrics;
    }
  }

  /**
   * @description Get metrics from values
   * @param {Array|String} values - The values to get metrics for
   * @returns {Array}
   */
  getMetricsFromValues(values, useUrlParam=false) {
    if ( !Array.isArray(values) ) values = [values];
    if ( useUrlParam ){
      return this.metrics.filter(metric => values.includes(metric.urlParam));
    }
    return this.metrics.filter(metric => values.includes(metric.value));
  }

  get aggregators() {
    const aggregators = [
      {label: 'Fiscal Year', shortLabel: 'Fiscal Year', value: 'fiscalYear', urlParam: 'fiscal-year', isInt: true},
      {label: 'Department', shortLabel: 'Department', value: 'department', isInt: true},
      {label: 'Employee', shortLabel: 'Employee', value: 'employee'},
      {label: 'Funding Source', shortLabel: 'Fund', value: 'fundingSource', isDefaultY: true, urlParam: 'funding-source', isInt: true}
    ];
    return aggregators.map(data => new Aggregator(data));
  }

  defaultAggregator(axis='x', returnValue=false) {
    const defaultAggregator = this.aggregators.find(aggregator => aggregator.data[`isDefault${axis.toUpperCase()}`]);
    if ( returnValue ){
      return defaultAggregator?.value || '';
    } else {
      return defaultAggregator;
    }
  }

  get filters(){
    return this.aggregators.map(aggregator => new Filter(aggregator.data));
  }

}

export default new ReportUtils();


