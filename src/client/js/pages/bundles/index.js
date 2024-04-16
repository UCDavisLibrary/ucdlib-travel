/**
 * @description Bundles are groups of pages that will be dynamically loaded
 * if a user requests that page.
 * The object key refers to the bundle file name (without the .js extension)
 * The array value is a list of page ids that are in that bundle.
 */

// TODO: Replace these with your own bundle->pageid mappings
const defs = {
  all : [
    'home', 'foo'    
  ],

  approvalRequests: [
    'approval-request', 'approval-request-new', 'approver'
  ],
  admin: [
    'admin', 'admin-approvers', 'admin-settings', 
    'admin-allocations', 'admin-items', 'admin-reimbursement'
  ],
  reports: [
    'reports'
  ],
  reimbursementRequests: [
    'reimbursement', 'reimbursement-new'
  ]
};

export default defs;
