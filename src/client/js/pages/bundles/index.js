/**
 * @description Bundles are groups of pages that will be dynamically loaded
 * if a user requests that page.
 * The object key refers to the bundle file name (without the .js extension)
 * The array value is a list of page ids that are in that bundle.
 */

const defs = {
  "approval-requests": [
    'approval-request', 'approval-request-new', 'approver',
    'approval-requests', 'approval-request-confirm', 'approver-landing'
  ],
  "admin": [
    'admin', 'admin-approvers', 'admin-settings', 'admin-email-settings',
    'admin-allocations', 'admin-line-items', 'admin-reimbursement', 'admin-allocations-new','admin-approval-requests'
  ],
  "reports": [
    'reports'
  ],
  "reimbursement-requests": [
    'reimbursement', 'reimbursement-new'
  ]
};

export default defs;
