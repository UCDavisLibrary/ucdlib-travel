import fundingSource from "../../lib/db-models/fundingSource.js";
import protect from "../../lib/protect.js";
export default (api) => {

  api.get('/funding-source', protect('hasBasicAccess'), async (req, res) => {
    const data = await fundingSource.get({active: true});
    if ( data.error ){
      console.log(data);
    }
    return res.json(data);
  });

};
