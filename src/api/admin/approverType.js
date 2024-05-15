import approverType from "../../lib/db-models/approverType.js";
import protect from "../../lib/protect.js";

export default (api) => {

  /**
   * @description Query an approver-type
   */
  api.get('/approver-type', protect('hasBasicAccess'), async (req, res) => {
    const query = req.query;

    if (!query || Object.keys(query).length === 0 ) return res.status(400).json({error: true, message: 'Query is required.'});

    const data = await approverType.query(query);
    if ( data.error ) {
      console.error('Error in GET /approver-type', data.error);
      return res.status(500).json({error: true, message: 'Error getting approver-type.'});
    }
    res.json(data);
  });

  /**
   * @description Create an approver-type
   */
  api.post('/approver-type', protect('hasAdminAccess'), async (req, res) => {
    
    const approverTypeData = req.body;

    const data = await approverType.create(approverTypeData);
    if ( data.error ) {
      console.error('Error in POST /approver-type', data.error);
      return res.status(500).json({error: true, message: 'Error creating approver-type.'});
    }
    res.json({data: data, error: false});
  });


  /**
   * @description Update an approver-type
   */
     api.put('/approver-type', protect('hasAdminAccess'), async (req, res) => {
      const approverTypeData = req.body;

      const data = await approverType.update(approverTypeData);
      if ( data.error ) {
        console.error('Error in PUT /approver-type', data.error);
        return res.status(500).json({error: true, message: 'Error updating approver-type.'});
      }
      res.json({data: data, error: false});
    });
};
