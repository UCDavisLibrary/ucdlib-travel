import email  from "../../lib/db-models/emailController.js"
import protect from "../../lib/protect.js";
import urlUtils from "../../lib/utils/urlUtils.js";
import ar from "../../lib/db-models/approvalRequest.js";


export default (api) => {

  /**
   * @description Get array of notifications
   * @param {Object} req.body - new notification data
   */
  api.get('/comments-notification', protect('hasBasicAccess'), async (req, res) => {
    const kerberos = req.auth.token.id;
    const query = urlUtils.queryToCamelCase(req.query);

    const data = await email.getHistory(query);
    if( data.error ) {
      console.error('Error in GET /notification', data.error);
      return res.status(500).json({error: true, message: 'Error getting request history.'});
    }

    if( req.auth.token.hasAdminAccess) return res.json(data);

    let ids = data.data.map((n) => n.approvalRequestRevisionId)
    let aRequest = await ar.get({revisionIds: ids});
    const approvalRequest = aRequest.data;

    for(let notice of approvalRequest) {
      const isOwnNotifications = notice.employeeKerberos === kerberos;
      const inApprovalChain = notice.approvalStatusActivity.some(a => a.employeeKerberos === kerberos);

      if ( !isOwnNotifications && !inApprovalChain) return apiUtils.do403(res);
    }

    return res.json(data);
    
  });

  /**
   * @description Create a help comments
   * @param {Object} req.body - new notification data
   */
  api.post('/comments-notification', protect('hasBasicAccess'), async (req, res) => {
    const payload = (typeof req.body === 'object') && !Array.isArray(req.body) ? req.body : {};
    payload.token = req.auth.token;
    const sender = payload.token.token.email;
    const emailContent = payload.emailContent;


    if ( !emailContent.subject || !emailContent.text ) {
      return res.status(400).json({error: true, message: 'Error with payload section emailContent. Email Subject or Email Text can not be empty'});
    }

    const data = await email.sendHelpEmail(sender, 
                                           emailContent.subject, 
                                           emailContent.text, 
                                           payload.url,
                                           payload
                                          );


    if ( !data ) {
      return res.status(500).json(data);
    }

    return res.json(data);
  });

};
