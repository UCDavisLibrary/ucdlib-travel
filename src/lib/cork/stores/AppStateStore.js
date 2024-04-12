import { AppStateStore } from "@ucd-lib/cork-app-state";

/**
 * @description Implementation of AppStateStore
 */
class AppStateStoreImpl extends AppStateStore {
  constructor() {
    super();
    this.defaultPage = 'home';

    // TODO: Replace these with your own default values
    this.breadcrumbs = {
      home: {text: 'Home', link: '/'},
      request: {text: 'Request', link: '/request'},
      requestNew: {text: 'New Request', link: '/request/new'},
      reimbursement: {text: 'Reimbursement', link: '/reimbursement'},
      reimbursementNew: {text: 'New Reimbursement', link: '/reimbursement/new'},
      reports: {text: 'Reports', link: '/reports'},
      approver: {text: 'Approver', link: '/approver'},
      employeeAllocation: {text: 'Employee Allocation', link: '/employee-allocation'},
      employeeAllocationNew: {text: 'New Employee Allocation', link: '/employee-allocation/new'},
      settings: {text: 'Settings', link: '/settings'},
      lineItems: {text: 'Line Items', link: '/line-items'},
      fundingSources: {text: 'Funding Sources', link: '/funding-sources'},

    };

    this.userProfile = {};

    this.events.PAGE_STATE_UPDATE = 'page-state-update';
    this.events.PAGE_TITLE_UPDATE = 'page-title-update';
    this.events.BREADCRUMB_UPDATE = 'breadcrumb-update';
    this.events.ALERT_BANNER_UPDATE = 'alert-banner-update';
  }
}

const store = new AppStateStoreImpl();
export default store;
