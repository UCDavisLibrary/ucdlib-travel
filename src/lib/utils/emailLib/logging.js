import pg from "../../db-models/pg.js";
import EntityFields from "../EntityFields.js";

/**
 * @class Logging
 * @description Accessing the notification database and log to the notification database
 */
class Logging {

  constructor(){

    this.entityFields = new EntityFields([
      {
        dbName: 'notification_id',
        jsonName: 'notificationId',
      },
      {
        dbName: 'approval_request_revision_id',
        jsonName: 'approvalRequestRevisionId',
        label: 'Approval Request Revision Id',
      },
      {
        dbName: 'reimbursement_request_id',
        jsonName: 'reimbursementRequestId',
        label: 'Reimbursement Request Id',
      },
      {
        dbName: 'employee_kerberos',
        jsonName: 'employeeKerberos',
        charLimit: 100
      },
      {
        dbName: 'created_at',
        jsonName: 'createdAt',
      },
      {
        dbName: 'subject',
        jsonName: 'subject',
      },
      {
        dbName: 'email_sent',
        jsonName: 'emailSent',
      },
      {
        dbName: 'details',
        jsonName: 'details'
      },
      {
        dbName: 'notification_type',
        jsonName: 'notificationType'
      }
    ]);
  }

  /**
   * @description adds sent email notification to the notification table
   * @param {Object} data - email notification object
   * @returns {Object} {status, id}
   */
  async addNotificationLogging(data){
    data = this.entityFields.toDbObj(data);

    // delete system fields
    delete data.notification_id;
    data.created_at = new Date();

    // start transaction
    let notificationId;

    data = pg.prepareObjectForInsert(data);
    const sql = `INSERT INTO notification (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING notification_id`;
    const res = await pg.query(sql, data.values);

    if( res.error ) return res;

    if( res.res.rowCount !== 1 ) {
      throw new Error('Error creating notification');
    }
    notificationId = res.res.rows[0].notification_id;

    return {success: true, notificationId};
  }

  /**
   * @description get sent email notification to the notification table
   * @param {Object} kwargs - query
   * @returns {Object} {data, total, page, pageSize, totalPages}
   */
  async getNotificationLogging(kwargs={}){
    const page = Number(kwargs.page) || 1;
    const pageSize = kwargs.pageSize || 10;
    const noPaging = pageSize === -1;

    const whereArgs = {};
    if( kwargs.email_sent ) {
      whereArgs['n.email_sent'] = true;
    } else if( kwargs.email_sent === false ) {
      whereArgs['n.email_sent'] = false;
    }
    if( Array.isArray(kwargs.approval_request_ids) && kwargs.approval_request_ids.length) {
      whereArgs['n.approval_request_revision_id'] = kwargs.approval_request_ids;
    }
    if( Array.isArray(kwargs.reimbursement_ids) && kwargs.reimbursement_ids ) {
      whereArgs['n.reimbursement_request_id'] = kwargs.reimbursement_ids;
    }
    const whereClause = pg.toWhereClause(whereArgs);


    // get total count
    const countSql = `
      SELECT
        COUNT(DISTINCT n.notification_id) as total
      FROM
        notification n
      ${whereClause.sql ? `WHERE ${whereClause.sql}` : ''}
      `;

    const countRes = await pg.query(countSql, whereClause.values);

    if( countRes.error ) return countRes;
    const total = Number(countRes.res.rows[0].total);

    //get data
    const query = `
    SELECT
      n.*,
      (
          SELECT json_agg(json_build_object(
              'kerberos', emp.kerberos,
              'firstName', emp.first_name,
              'lastName', emp.last_name
          ))
          FROM employee emp
          WHERE n.employee_kerberos = emp.kerberos
      ) AS employees
    FROM
        notification n
    ${whereClause.sql ? `WHERE ${whereClause.sql}` : ''}
    ${noPaging ? '' : `LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`}
    `;


    const res = await pg.query(query, whereClause.values);
    if( res.error ) return res;

    const data = this.entityFields.toJsonArray(res.res.rows);

    const totalPages = noPaging ? 1 : Math.ceil(total / pageSize);
    return {data, total, page, pageSize, totalPages};
  }

}
export default new Logging();
