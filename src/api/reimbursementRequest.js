import protect from "../lib/protect.js";
import uploads from "../lib/utils/uploads.js";
import typeTransform from "../lib/utils/typeTransform.js";
import reimbursementRequest from "../lib/db-models/reimbursementRequest.js";


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

  // todo authorize user

  // add uploaded files to data
  data.receipts = (Array.isArray(data.receipts) ? data.receipts : []).map((receipt, i) => {
    const file = req.files?.[i];
    if ( !file ) return receipt;
    receipt.filePath = file.path;
    receipt.fileType = file.mimetype;
    receipt.uploadedBy = kerberos;
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


  res.json({ success: true });
};

