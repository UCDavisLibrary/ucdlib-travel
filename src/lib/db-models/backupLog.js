import pg from "./pg.js";
import serverConfig from "../serverConfig.js";

class BackupLog {

  /**
   * @description Check if the backup log table exists
   * @returns {Boolean} - True if the table exists, false otherwise
   */
  async tableExists(){
    if ( !serverConfig.backup.tableName ) {
      return false;
    }
    const res = await pg.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = $1
      )
    `, [serverConfig.backup.tableName]);
    return res?.res?.rows?.[0]?.exists || false;
  }

  /**
   * @description Get the last backup entry from the backup log
   * @returns {Object} - Result of the query
   */
  async lastBackup(){
    return await pg.query(`
      SELECT * FROM ${serverConfig.backup.tableName}
      ORDER BY backup_time DESC
      LIMIT 1
    `);
  }

  /**
   * @description Check if the last backup was within a specified interval
   * @param {String} interval - Postgres interval string, e.g. '2 days'
   * @default interval - Uses serverConfig.backup.statusFailAfterInterval if not provided
   * @returns
   */
  async lastBackupWithinInterval(interval){
    interval = interval || serverConfig.backup.statusFailAfterInterval;

    return await pg.query(`
      SELECT * FROM ${serverConfig.backup.tableName}
      WHERE backup_time > NOW() - INTERVAL '${interval}'
      ORDER BY backup_time DESC
      LIMIT 1
    `);
  }

}

export default new BackupLog();
