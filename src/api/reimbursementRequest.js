import protect from "../lib/protect.js";
import uploads from "../lib/utils/uploads.js";
import typeTransform from "../lib/utils/typeTransform.js";
import reimbursementRequest from "../lib/db-models/reimbursementRequest.js";
import approvalRequest from "../lib/db-models/approvalRequest.js";


export default (api) => {

  api.post(
    '/reimbursement-request',
    protect('hasBasicAccess'),
    uploads.uploadReiumbursementReceipts(),
    createReimbursementRequest
  );
};

const createReimbursementRequest = async (req, res) => {
  const kerberos = req.auth.token.id;

  // parse reimbursementRequest data
  const data = typeTransform.parseJsonString(req.body.reimbursementRequest, {});
  if ( ! typeof data === 'object' || !Object.keys(data).length) {
    return res.status(400).json({ error : 'Invalid reimbursement request data' });
  }

  // authorize user
  const approvalRequestId = typeTransform.toPositiveInt(data.approvalRequestId);
  if ( !approvalRequestId ) {
    uploads.deleteUploadedFiles(req.files);
    return res.status(400).json({ error: 'Invalid approval request id' });
  }
  let approvalRequestData = await approvalRequest.get({requestIds: [approvalRequestId], isCurrent: true});
  if ( approvalRequestData.error ) {
    uploads.deleteUploadedFiles(req.files);
    console.error('Error in POST /reimbursement-request', approvalRequestData.error);
    return res.status(500).json({ error: true, message: 'Error creating reimbursement request'});
  }
  if ( !approvalRequestData.total ) {
    uploads.deleteUploadedFiles(req.files);
    return res.status(400).json({ error: 'Approval request not found' });
  }
  approvalRequestData = approvalRequestData.data[0];
  if ( approvalRequestData.employeeKerberos !== kerberos ) {
    uploads.deleteUploadedFiles(req.files);
    return res.status(403).json({ error: 'You are not authorized to submit a reimbursement request for this travel request.' });
  }

  // add uploaded files to data
  data.receipts = (Array.isArray(data.receipts) ? data.receipts : []).map((receipt, i) => {
    receipt = receipt || {};
    const file = req.files?.[i];
    if ( !file ) return receipt;
    receipt.filePath = file.path;
    receipt.fileType = file.mimetype;
    receipt.uploadedBy = kerberos;
    receipt.deleted = false;
    receipt.deletedBy = null;
    receipt.deletedAt = null;
    return receipt;
  });

  console.log(data);

  const result = await reimbursementRequest.create(data);

  if ( result.error ) {
    uploads.deleteUploadedFiles(req.files);
    if ( result.is400 ) {
      return res.status(400).json(result);
    }
    console.error('Error in POST /reimbursement-request', result.error);
    return res.status(500).json({ error: true, message: 'Error creating reimbursement request'});
  }


  res.json(result);
};

