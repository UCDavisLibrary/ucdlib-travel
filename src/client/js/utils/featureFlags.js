import { appConfig } from '../../../lib/appGlobals.js';

/**
 * @description Utility class for managing feature flags in the application.
 */
class FeatureFlags {
  constructor(){
    this.flags = appConfig.featureFlags || {};
  }

  /**
   * @description Filters out metrics based on feature flags.
   * @param {Array} metrics
   * @returns
   */
  reportMetrics(metrics){
    if ( !this.flags.reimbursementRequest ){
      const values = ['requestedOrReimbursed', 'allocatedMinusRequestedOrReimbursed'];
      metrics = metrics.filter(metric => !values.includes(metric.value));
    }
    return metrics;
  }

  get reimbursementDisabled() {
    return !this.flags.reimbursementRequest;
  }
}

export default new FeatureFlags();
