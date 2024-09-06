import Metric from './Metric.js';
import Aggregator from './Aggregator.js';

/**
 * @description Isomorphic utility functions for reports
 */
class ReportUtils {

  get metrics() {
    const metrics = [
      {label: 'Amount Allocated', shortLabel: 'Allocated', value: 'allocated', isDefault: true},
      {label: 'Amount Requested', shortLabel: 'Requested', value: 'requested', isDefault: true},
      {label: 'Amount Requested or Reimbursed', shortLabel: 'Requested/Reimbursed', value: 'requestedOrReimbursed'},
      {label: 'Amount Allocated Minus Requested', shortLabel: 'Allocated - Requested', value: 'allocatedMinusRequested'},
      {label: 'Amount Allocated Minus Requested or Reimbursed', shortLabel: 'Allocated - Requested/Reimbursed', value: 'allocatedMinusRequestedOrReimbursed'},
      {label: 'Release Time (Hours)', shortLabel: 'Release Time', value: 'releaseTime'}
    ];
    return metrics.map(data => new Metric(data));
  }

  defaultMetrics(returnValue) {
    const defaultMetrics = this.metrics.filter(metric => metric.data.isDefault);
    if ( returnValue ){
      return defaultMetrics.map(metric => metric.value);
    } else {
      return defaultMetrics;
    }
  }

  get aggregators() {
    const aggregators = [
      {label: 'Fiscal Year', shortLabel: 'Fiscal Year', value: 'fiscalYear'},
      {label: 'Department', shortLabel: 'Department', value: 'department'},
      {label: 'Employee', shortLabel: 'Employee', value: 'employee'},
      {label: 'Funding Source', shortLabel: 'Fund', value: 'fundingSource', isDefaultY: true}
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

}

export default new ReportUtils();


