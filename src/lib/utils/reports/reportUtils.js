import Metric from './Metric.js';

/**
 * @description Isomorphic utility functions for reports
 */
class ReportUtils {

  get metrics() {
    const metrics = [
      {label: 'Amount Allocated', shortLabel: 'Allocated', value: 'allocated'},
      {label: 'Amount Requested', shortLabel: 'Requested', value: 'requested'},
      {label: 'Amount Requested or Reimbursed', shortLabel: 'Requested/Reimbursed', value: 'requestedOrReimbursed'},
      {label: 'Amount Allocated Minus Requested', shortLabel: 'Allocated - Requested', value: 'allocatedMinusRequested'},
      {label: 'Amount Allocated Minus Requested or Reimbursed', shortLabel: 'Allocated - Requested/Reimbursed', value: 'allocatedMinusRequestedOrReimbursed'},
      {label: 'Release Time (Hours)', shortLabel: 'Release Time', value: 'releaseTime'}
    ];
    return metrics.map(data => new Metric(data));
  }

}

export default new ReportUtils();


