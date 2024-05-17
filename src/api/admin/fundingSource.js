import fundingSource from "../../lib/db-models/fundingSource.js";
import apiUtils from "../../lib/utils/apiUtils.js";
import protect from "../../lib/protect.js";
export default (api) => {

  /**
   * @description Get array of all active (non-archived) funding sources
   */
  api.get('/funding-source', protect('hasBasicAccess'), async (req, res) => {
    const data = await fundingSource.get({active: true});
    if ( data.error ){
      console.error('Error in GET /funding-source', data.error);
      return res.status(500).json({error: true, message: 'Error getting funding sources.'});
    }
    return res.json(data);
  });

  /**
   * @description Get array of funding sources by id
   * @param {String} req.params.ids - comma-separated list of funding source ids
   */
  api.get('/funding-source/:ids', protect('hasBasicAccess'), async (req, res) => {
    const ids = apiUtils.explode(req.params.ids, true);
    if ( !ids ) return res.status(400).json({error: true, message: 'No valid ids provided.'});

    const data = await fundingSource.get({ids});
    if ( data.error ){
      console.error('Error in GET /funding-source/:ids', data.error);
      return res.status(500).json({error: true, message: 'Error getting funding sources.'});
    }
    return res.json(data);
  });

};
