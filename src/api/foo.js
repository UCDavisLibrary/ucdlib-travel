import foo from "../lib/db-models/foo.js";
import protect from "../lib/protect.js";

/**
 * @param {Router} api - Express router instance
 */
export default (api) => {

  api.get('/foo', protect('hasBasicAccess'), async (req, res) => {

    let response = await foo.getAll();
    if ( response.error ) {
      console.error('Error retrieving foo: ', response.error);
      res.status(500).json({
        error: true,
        message: 'Error retrieving foo'
      });
      return;
    }

    res.json(response.res.rows);

  });

}
