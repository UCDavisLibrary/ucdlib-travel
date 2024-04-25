import settings from "../../lib/db-models/settings.js";
export default (api) => {

  api.get('/settings', async (req, res) => {

    //const test = await settings.getByCategory('admin-settings');
    const settingsObj = {
      settingsId: 1,
      key: 'mileage_rate',
      value: '0.58'
    };
    const settingsObj2 = {
      settingsId: 1,
      key: 'mileage_rate',
      useDefaultValue: true
    }
    const test = await settings.updateSettings([settingsObj, settingsObj2]);
    res.json({test});
  });
};
