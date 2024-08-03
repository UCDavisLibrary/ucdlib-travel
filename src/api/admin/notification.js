import email  from "../../lib/db-models/emailController.js"
import protect from "../../lib/protect.js";

export default (api) => {

  /**
   * @description Get array of notifications
   */
  api.get('/comments-notification', protect('hasBasicAccess'), async (req, res) => {
    const kerberos = req.auth.token.id;
    // let isSingleNotifications;
    const data = await email.getHistory();
    if( data.error ) {
      console.error('Error in GET /notification', data.error);
      return res.status(500).json({error: true, message: 'Error getting request history.'});
    }
    if( req.auth.token.hasAdminAccess) return res.json(data);

    // if(data.data.length === 1) isSingleNotifications = true;


    const usersNotifications = new Set();

    for(let notice of data.data) {
      const isOwnNotifications = notice.employeeKerberos === kerberos;
      if ( !isOwnNotifications ) return apiUtils.do403(res);
    }

    return res.json(data);
    
  });

  /**
   * @description Create a help comments
   * @param {Object} req.body - new line item data
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

  /**
   * @description Create a system comments
   * @param {Object} req.body - new line item data
   * TODO: remove method when feature is complete
   */
     api.post('/system-notification', protect('hasAdminAccess'), async (req, res) => {
      const payload = (typeof req.body === 'object') && !Array.isArray(req.body) ? req.body : {};
      payload.token = req.auth.token;
      const data = await email.sendSystemNotification(payload.notificationType, 
                                                      payload.requests.approvalRequest, 
                                                      payload.requests.reimbursementRequest, 
                                                      payload
                                                     );

      if ( data.error && data.is500 ) {
          return res.status(500).json(data);
      }
      if ( data.error ) {
        console.error('Error in POST /notification', data.error);
        return res.status(500).json({error: true, message: 'Error creating comment/question item.'});
      }
      return res.json(data);
    });
  
  

};
