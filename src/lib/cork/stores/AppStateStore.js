import { AppStateStore } from "@ucd-lib/cork-app-state";

/**
 * @description Implementation of AppStateStore
 */
class AppStateStoreImpl extends AppStateStore {
  constructor() {
    super();
    this.defaultPage = 'home';

    this.breadcrumbs = {
      home: {text: 'Home', link: '/'},
      'approval-request-new': {text: 'New', link: '/approval-request/new'},
      'approval-requests': {text: 'Your Approval Requests', link: '/approval-request'},
      'approver': {text: 'Approve a Request', link: '/approver'},
      'reports': {text: 'Reports', link: '/reports'},
      'admin': {text: 'Admin', link: '/admin'},
      'admin-allocations': {text: 'Employee Allocations', link: '/admin/allocations'},
      'admin-approvers': {text: 'Approvers and Funding Sources', link: '/admin/approvers'},
      'admin-reimbursement': {text: 'Reimbursement Requests', link: '/admin/reimbursement'},
      'admin-settings': {text: 'General Settings', link: '/admin/settings'},
      'admin-line-items': {text: 'Line Items', link: '/admin/items'}
    };

    this.userProfile = {};

    this.events.PAGE_STATE_UPDATE = 'page-state-update';
    this.events.PAGE_TITLE_UPDATE = 'page-title-update';
    this.events.BREADCRUMB_UPDATE = 'breadcrumb-update';
    this.events.TOAST_UPDATE = 'toast-update';
    this.events.TOAST_DISMISS = 'toast-dismiss';
    this.events.DIALOG_OPEN = 'dialog-open';
    this.events.DIALOG_ACTION = 'dialog-action';

  }
}

const store = new AppStateStoreImpl();
export default store;
