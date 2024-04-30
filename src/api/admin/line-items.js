import expenditureOptions from "../../lib/db-models/expenditureOptions.js";
import apiUtils from "../../lib/utils/apiUtils.js";
import protect from "../../lib/protect.js";

export default (api) => {

  /**
   * @description Get array of active (non-archived) line items
   */
  api.get('/line-items', protect('hasBasicAccess'), async (req, res) => {
    const data = await expenditureOptions.get({active: true});
    if( data.error ) {
      console.error('Error in GET /line-items', data.error);
      return res.status(500).json({error: true, message: 'Error getting line items.'});
    }

    return res.json(data);
  });

  /**
   * @description Create a new line item
   * @param {Object} req.body - new line item data
   */
  api.post('/line-items', protect('hasAdminAccess'), async (req, res) => {
    const payload = (typeof req.body === 'object') && !Array.isArray(req.body) ? req.body : {};
    const data = await expenditureOptions.create(payload);

    if ( data.error && data.is400 ) {
      return res.status(400).json(data);
    }
    if ( data.error ) {
      console.error('Error in POST /line-items', data.error);
      return res.status(500).json({error: true, message: 'Error creating line item.'});
    }

    return res.json(data);
  });

  /**
   * @description Update an array of line items
   * @param {Object} req.body - A line item object
   */
  api.put('/line-items', protect('hasAdminAccess'), async (req, res) => {

    const payload = (typeof req.body === 'object') && !Array.isArray(req.body) ? req.body : {};
    const data = await expenditureOptions.update(payload);

    if ( data.error && data.is400 ) {
      return res.status(400).json(data);
    }
    if ( data.error ) {
      console.error('Error in PUT /line-items', data.error);
      return res.status(500).json({error: true, message: 'Error updating line item.'});
    }

    return res.json(data);
  });
};
