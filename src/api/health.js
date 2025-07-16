import backupLog from '../lib/db-models/backupLog.js';
import settings from '../lib/db-models/settings.js';
import serverConfig from '../lib/serverConfig.js';

export default (app) => {
  app.get('/health', async (req, res) => {
    try {
      const services = {};

      // check database
      const settingsData = await settings.getByKey('mileage_rate', false);
      services.database = {
        status: settingsData?.error ? 'fail' : 'pass'
      };

      // check last time backup service was successfully run
      const backupLogExists = await backupLog.tableExists();
      if ( backupLogExists && serverConfig.backup.statusFailAfterInterval ) {
        const lastBackup = await backupLog.lastBackupWithinInterval();

        if ( lastBackup.error ){
          throw lastBackup.error;
        }

        services.backup = {
          status: lastBackup.res.rows.length > 0 ? 'pass' : 'fail',
          failAfterInterval: serverConfig.backup.statusFailAfterInterval
        };

        if ( lastBackup.res.rows.length ) {
          services.backup.lastBackup = lastBackup.res.rows[0].backup_time;
        } else {
          let b = await backupLog.lastBackup();
          if ( b.error ) {
            throw b.error;
          }
          services.backup.lastBackup = b.res?.rows?.[0]?.backup_time || null;
        }

      }

      const overallStatus = Object.values(services).every(service => service.status === 'pass') ? 'pass' : 'fail';

      res.status(200).json({ status: overallStatus, services });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ status: 'fail', error: error.message });
    }
  });
}
