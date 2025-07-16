import cache from "../../lib/db-models/cache.js";
import protect from "../../lib/protect.js";



export default (api) => {

    /**
     * @description Query Cache
     */
    api.get('/cache', protect('hasAdminAccess'), async (req, res) => {
       
        const query = req.query;
        if (!query || Object.keys(query).length === 0 ) return res.status(400).json({error: true, message: 'Query is required.'});

        
        const data = await cache.search(query);
        if ( data.error ) {
            console.error('Error in GET /cache', data.error);
            return res.status(500).json({error: true, message: 'Error getting cache results.'});
        }
        res.json({data: data.res.rows, error: false});
    });
  
    /**
     * @description Delete cache items
     */
    api.delete('/cache', protect('hasAdminAccess'), async (req, res) => {
        const deleteBody = req.body;
        const data = [];
        
        for (const c of deleteBody){
            let res = await cache.delete(c.type, c.query);
            data.push(res);
        }

        const hasError = data.some(item => item.error === true);


        if ( hasError) {
            console.error('Error in DELETE /cache', data.error);
            return res.status(500).json({error: true, message: 'Error deleting cache item.'});
        }

      res.json({data: data, error: false});
    });
  
  
    /**
     * @description Get Count in the cache daabase
     */
    api.get('/cache/count', protect('hasAdminAccess'), async (req, res) => {

      const data = await cache.getCacheCount();
      

      if ( data.error ) {
        console.error('Error in GET /cache/count', data.error);
        return res.status(500).json({error: true, message: 'Error getting count.'});
      }
      res.json({data: data.res.rows, error: false});
    });
  };