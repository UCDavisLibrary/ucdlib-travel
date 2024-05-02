import settings from "../../lib/db-models/settings.js";
import apiUtils from "../../lib/utils/apiUtils.js";
import protect from "../../lib/protect.js";

export default (api) => {

  /**
   * @description Get array of settings by category
   */
  api.get('/settings/category/:category', protect('hasBasicAccess'), async (req, res) => {

    const category = req.params.category;

    if ( !category ) return res.status(400).json({error: true, message: 'Category is required.'});

    const data = await settings.getByCategory(category);
    if ( data.error ) {
      console.error('Error in /settings/:category', data.error);
      return res.status(500).json({error: true, message: 'Error getting settings.'});
    }
    return res.json(data);
  });

  /**
   * @description Update an array of settings
   */
  api.put('/settings', protect('hasAdminAccess'), async (req, res) => {
    const settingsData = req.body;
    if ( !apiUtils.isArrayOfObjects(settingsData) ){
      return res.status(400).json({error: true, message: 'Settings data must be an array of objects.'});
    }
    const data = await settings.updateSettings(settingsData);
    if ( data.error ) {
      console.error('Error in PUT /settings', data.error);
      return res.status(500).json({error: true, message: 'Error updating settings.'});
    }
    return res.json({error: false});
  });
};
