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

  // parse reimbursementRequest data
  const data = typeTransform.parseJsonString(req.body.reimbursementRequest, {});
  if ( ! typeof data === 'object' || !Object.keys(data).length) {
    return res.status(400).json({ error : 'Invalid reimbursement request data' });
  }
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

