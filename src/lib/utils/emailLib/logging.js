import serverConfig from "../../serverConfig.js";
import pg from "../../db-models/pg.js";
import fetch from 'node-fetch';
import EntityFields from "../EntityFields.js";

/**
 * @class Logging
 * @description Utility class for querying the library IAM API.
 * Does auth.
 */
 export default class Logging {

  constructor(payload = {}){
    this.payload = payload;

    this.entityFields = new EntityFields([
      {
        dbName: 'notification_id',
        jsonName: 'notificationId',
        validateType: 'integer'
      },
      {
        dbName: 'approval_request_revision_id',
        jsonName: 'approvalRequestRevisionId',
        label: 'Approval Request Revision Id',
        validateType: 'integer'
      },
      {
        dbName: 'reimbursement_request_id',
        jsonName: 'reimbursementRequestId',
        label: 'Reimbursement Request Id',
        validateType: 'integer'
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
        validateType: 200
      },
      {
        dbName: 'email_sent',
        jsonName: 'emailSent',
        validateType: 'boolean'
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

  async addNotificationLogging(data){
    data = this.entityFields.toDbObj(data);

    const validation = await this.entityFields.validate(data, ['notification_id']);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    // delete system fields
    delete data.notification_id;
    data.created_at = new Date();

    // start transaction
    let notificationId;
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      // insert funding source
      data = pg.prepareObjectForInsert(data);
      const sql = `INSERT INTO notification (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING notification_id`;
      const res = await client.query(sql, data.values);
      if( res.rowCount !== 1 ) {
        throw new Error('Error creating notification');
      }
      notificationId = res.rows[0].notification_id;

      // update approver types

      await client.query('COMMIT');

    } catch (e) {
      await client.query('ROLLBACK');
      return {error: e, message: 'Error creating notification'};
    } finally {
      client.release();
    }

    return {success: true, notificationId};
  }

  async getNotificationLogging(kwargs={}){
    const whereArgs = {};
    if( kwargs.email_sent ) {
      whereArgs['n.email_sent'] = true;
    } else if( kwargs.archived ) {
      whereArgs['n.email_sent'] = false;
    }
    if( kwargs.request_ids ) {
      whereArgs['n.approval_request_revision_id'] = Array.isArray(kwargs.request_ids) ? kwargs.request_ids : [kwargs.request_ids];
    }
    if( kwargs.reimbursement_ids ) {
      whereArgs['n.reimbursement_request_id'] = Array.isArray(kwargs.reimbursement_ids) ? kwargs.reimbursement_ids : [kwargs.reimbursement_ids];
    }


    const whereClause = pg.toWhereClause(whereArgs);

    const query = `
    SELECT
      n.*,
      CASE 
          WHEN ar.approval_request_revision_id IS NULL THEN NULL 
          ELSE json_build_object(
              'approval_request_revision_id', ar.approval_request_revision_id,
              'approval_request_id', ar.approval_request_id,
              'is_current', ar.is_current,
              'reimbursement_status', ar.reimbursement_status,
              'employee_kerberos', ar.employee_kerberos,
              'label', ar.label,
              'organization', ar.organization,
              'location', ar.location,
              'location_details', ar.location_details,
              'program_start_date', ar.program_start_date,
              'program_end_date', ar.program_end_date,
              'travel_required', ar.travel_required,
              'has_custom_travel_dates', ar.has_custom_travel_dates,
              'travel_start_date', ar.travel_start_date,
              'travel_end_date', ar.travel_end_date,
              'comments', ar.comments,
              'no_expenditures', ar.no_expenditures,
              'validated_successfully', ar.validated_successfully,
              'submitted_at', ar.submitted_at
          )
      END AS approval_request,
      CASE 
          WHEN rr.reimbursement_request_id IS NULL THEN NULL 
          ELSE json_build_object(
              'reimbursement_request_id', rr.reimbursement_request_id,
              'approval_request_id', rr.approval_request_id,
              'label', rr.label,
              'employee_residence', rr.employee_residence,
              'travel_start', rr.travel_start,
              'travel_end', rr.travel_end,
              'personal_time', rr.personal_time,
              'comments', rr.comments,
              'status', rr.status
          )
      END AS reimbursement_request,
      (
          SELECT json_agg(json_build_object(
              'kerberos', emp.kerberos,
              'firstName', emp.first_name,
              'lastName', emp.last_name
          ))
          FROM employee emp
          WHERE ar.employee_kerberos = emp.kerberos
      ) AS employees
    FROM
        notification n
    LEFT JOIN
        approval_request ar ON n.approval_request_revision_id = ar.approval_request_revision_id
    LEFT JOIN
        reimbursement_request rr ON n.reimbursement_request_id = rr.reimbursement_request_id
    ${whereClause.sql ? `WHERE ${whereClause.sql}` : ''};
    `;


    const res = await pg.query(query, whereClause.values);
    if( res.error ) return res;
    return res.res.rows;
  }

  formatNotificationLogging(data){
    
  }

}
