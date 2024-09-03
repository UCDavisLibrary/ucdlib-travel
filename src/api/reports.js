import protect from "../lib/protect.js";
import settings from "../lib/db-models/settings.js";
import reports from "../lib/db-models/reports.js";

const basePath = '/reports';

export default (api) => {
  api.get(`${basePath}/access-level`, protect('hasBasicAccess'), async (req, res) => {
    const out = {
      helpUrl: await settings.getValue('auth_request_url', '')
    };

    const accessLevel = await reports.getAccessLevel(req.auth.token);
    if ( accessLevel.error ){
      console.error('Error fetching access level', accessLevel);
      return res.status(500).json({error: true, message: 'Error fetching access level'});
    }
    out.hasAccess = accessLevel.hasAccess;
    out.departmentRestrictions = accessLevel.departmentRestrictions;

    return res.json(out);

  });
};
