import email from "../../lib/db-models/emailController.js"
import apiUtils from "../../lib/utils/apiUtils.js";
import protect from "../../lib/protect.js";

export default (api) => {

  /**
   * @description Get array of active (non-archived) line items
   */
  api.get('/notification', protect('hasBasicAccess'), async (req, res) => {
    const data = await email.getHistory();
    if( data.error ) {
      console.error('Error in GET /notification', data.error);
      return res.status(500).json({error: true, message: 'Error getting request history.'});
    }
    return res.json(data);
  });

  /**
   * @description Create a new line item
   * @param {Object} req.body - new line item data
   */
  api.post('/notification', protect('hasAdminAccess'), async (req, res) => {
    const payload = (typeof req.body === 'object') && !Array.isArray(req.body) ? req.body : {};
    const data = await email.createEmail(payload);

    if ( data.error && data.is400 ) {
      return res.status(400).json(data);
    }
    if ( data.error ) {
      console.error('Error in POST /notification', data.error);
      return res.status(500).json({error: true, message: 'Error creating comment/question item.'});
    }
    return res.json(data);
  });

};
