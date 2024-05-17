import protect from "../lib/protect.js";
import approvalRequest from "../lib/db-models/approvalRequest.js";
import employee from "../lib/db-models/employee.js";
import IamEmployeeObjectAccessor from "../lib/utils/iamEmployeeObjectAccessor.js";

export default (api) => {

  api.post('/approval-request', protect('hasBasicAccess'), async (req, res) => {
    const data = req.body || {};

    // todo: check if is revision of existing request, and validate that the user has permission to do so

    // get full employee object (with department) for logged in user
    const kerberos = req.auth.token.id;
    let employeeObj = await employee.getIamRecordById(kerberos);
    if ( employeeObj.error ) {
      console.error('Error getting employee object in POST /approval-request', employeeObj.error);
      return res.status(500).json({error: true, message: 'Error creating approval request.'});
    }
    employeeObj = (new IamEmployeeObjectAccessor(employeeObj.res)).travelAppObject;

    // set status fields
    data.approvalStatus = data.approvalStatus === 'draft' ? 'draft' : 'submitted';
    data.reimbursementStatus = data.noExpenditures ? 'not-required' : 'not-submitted';

    // create approval request revision
    const result = await approvalRequest.createRevision(data, employeeObj);
    if ( result.error && result.is400 ) {
      return res.status(400).json(result);
    }
    if ( result.error ) {
      console.error('Error in POST /approval-request', result.error);
      return res.status(500).json({error: true, message: 'Error creating approval request.'});
    }

    res.json(result);
  });

};
