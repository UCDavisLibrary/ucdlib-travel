import expenditureOptions from "../../lib/db-models/expenditureOptions.js";
import apiUtils from "../../lib/utils/apiUtils.js";
import protect from "../../lib/protect.js";

export default (api) => {

  api.get('/line-items', protect('hasBasicAccess'), async (req, res) => {
    const data = await expenditureOptions.get({active: true});
    if( data.error ) {
      console.error('Error in GET /line-items', data.error);
      return res.status(500).json({error: true, message: 'Error getting line items.'});
    }

    return res.json(data);
  });

  api.post('/line-items', protect('hasAdminAccess'), async (req, res) => {
    const test = {
      label: 'Test Label',
      description: 'Test Description',
      formOrder: 1
    };
    const data = await expenditureOptions.create(test);

    if ( data.error && data.is400 ) {
      return res.status(400).json(data);
    }
    if ( data.error ) {
      console.error('Error in POST /line-items', data.error);
      return res.status(500).json({error: true, message: 'Error creating line item.'});
    }

    return res.json(data);
  });

  api.put('/line-items', protect('hasAdminAccess'), async (req, res) => {
    const test = {
      expenditureOptionId: 10,
      label: 'Updated label',
      archived: true
    };
    const data = await expenditureOptions.update(test);

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
