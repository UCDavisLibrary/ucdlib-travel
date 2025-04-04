import mysql from 'mysql2/promise';
import pg from 'pg'
import loading from 'loading-cli';

const { Client } = pg;
// import funding from '@ucd-lib/travel-app-server/lib/db-models/fundingSource.js';
// import expenditure from '@ucd-lib/travel-app-server/lib/db-models/expenditureOptions.js';
import IamEmployeeObjectAccessor from '@ucd-lib/travel-app-server/lib/utils/iamEmployeeObjectAccessor.js';
import employee from "@ucd-lib/travel-app-server/lib/db-models/employee.js";
import approvalRequest from '@ucd-lib/travel-app-server/lib/db-models/approvalRequest.js';
import log from '@ucd-lib/travel-app-server/lib/utils/log.js';
import fiscalYearUtils from '@ucd-lib/travel-app-server/lib/utils/fiscalYearUtils.js';

class Migration {
  constructor(){}

    // Create a connection to the MySQL database
    async connectToMySQLDatabase(){
        const pool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'mysql',
            port: process.env.MYSQL_PORT || '3306',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_ROOT_PASSWORD || 'root_password',
            database: process.env.MYSQL_DATABASE || 'db_mysql'
        });
        const connection = await pool.getConnection();;

        return connection;
    };

    // Create a connection to the Postgres database
    async insertIntoPostgresDatabase(rows) {
        const connection = new Client({
            user: process.env.PGUSER || 'postgres',
            host: process.env.PGHOST || 'host.docker.internal',
            database: process.env.PGDATABASE || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'localhost',
            port: process.env.PGPORT || 5432
        });

        return await this.runPostgresQuery(rows, connection);
    };


    // Run MySQL query
    async runPostgresQuery(rows, connection) {
        const conn = await connection;

        conn.connect()
        .then(() => console.log('Connected to PostgreSQL successfully'))
        .catch(err => console.error('Connection error', err.stack));

        let funded = await conn.query('SELECT * FROM funding_source');
        let exp = await conn.query('SELECT * FROM expenditure_option');

        conn.end(); // Close the connection

        console.log("Loading Started...");

        const loader = loading({
            "text":"Loading MySQL Rows",
            "color":"green",
            "interval":200,
            "stream": process.stdout,
            "frames": ["◐", "◓", "◑", "◒"]
        }).start();

        let errorList = [];

        for(let row of rows){
            let errorObject = {};
            const query = row.lib_user[0].kerberosId;
            let employeeObj = await employee.getIamRecordById(query);
            employeeObj = (new IamEmployeeObjectAccessor(employeeObj.res)).travelAppObject;

            let data = await this.formatJson(row, funded.rows, exp.rows);

            // create createRevision
            const draftResult = await approvalRequest.createRevision(data, employeeObj, false);

            if ( draftResult && draftResult.error ) {
                errorObject = {
                    formID: row.id,
                    errorMessage:"Error when creating a draft",
                    errorPayload: draftResult,
                    data: data,
                };
                errorList.push(errorObject);
                continue;
            }

            // create submitDraft
            const submitResult = await approvalRequest.submitDraft(draftResult.approvalRequestId);
            if ( submitResult && submitResult.error) {
                errorObject = {
                    formID: row.id,
                    errorMessage:"Error when submitting a draft",
                    errorPayload: submitResult,
                    data: data
                };
                errorList.push(errorObject);
                continue;
            }

            let approvalRequestObj = await approvalRequest.get({requestIds: [draftResult.approvalRequestId], isCurrent: true});

            approvalRequestObj = approvalRequestObj.data[0];

            /* statusUpdate
                - submit
                - approver
                - submitter
            */

            const result = await this.statusUpdate(row, approvalRequestObj);
            if ( result && result.error ) {
                errorObject = {
                    formID: row.id,
                    errorMessage:"Error when updating the status",
                    errorPayload: result,
                    data: data
                };
                errorList.push(errorObject);
                continue;
            }

            if ( row.status == 'approved' ){
              const autoApproveResult = await this.autoApprove(approvalRequestObj.approvalRequestId);
              if ( autoApproveResult && autoApproveResult.error ) {
                errorObject = {
                    formID: row.id,
                    errorMessage:"Error when auto-approving",
                    errorPayload: autoApproveResult,
                    data: data
                };
                errorList.push(errorObject);
                continue;
              }
            }

        }

        loader.succeed(['Insertion Completed!\n\n']);
        return errorList;
    };

    async autoApprove(approvalRequestId) {
      let approvalRequestObj = await approvalRequest.get({requestIds: [approvalRequestId], isCurrent: true});
      approvalRequestObj = approvalRequestObj.data[0];

      for (const activity of approvalRequestObj.approvalStatusActivity) {
        if (activity.action === 'approval-needed') {
          let payload = {action: 'approve', comments: 'Auto-approved by system during migration process due to discrepancies in funding source approval requirements.'};
          const r = await approvalRequest.doApproverAction(approvalRequestObj.approvalRequestId, payload, activity.employeeKerberos	);
          if ( r.error ) {
            return r;
          }
        }
      }

    }

    async statusUpdate(bigsysRecord, approvalRequestObj) {
      const data = bigsysRecord.activity_history;
        let ap = approvalRequestObj.approvalStatusActivity;
        const dataIntersection = data.filter((obj1) =>
            ap.some((obj2) => obj1.employee && obj2.employee.kerberos === obj1.employee[0].kerberosId)
        );

        const result = {};

        for(let act of dataIntersection) {
            if (!act.employee) {
                continue;
            }

            const query = act.employee[0].kerberosId;
            let employeeObj = await employee.getIamRecordById(query);
            employeeObj = (new IamEmployeeObjectAccessor(employeeObj.res)).travelAppObject;
            const comments = this.formatText(act.comments);

            if(act.action == 'Approved'){
                let payload = {action: 'approve', comments};
                result.approved = await approvalRequest.doApproverAction(approvalRequestObj.approvalRequestId, payload, employeeObj.kerberos);

                if ( result.approved && result.approved.error ) {
                    result.error = true;
                    return
                }
            }

            if(act.action == 'Not Approved' && bigsysRecord.status != 'approved'){
                let payload = {action: 'deny', comments};
                result.notApproved = await approvalRequest.doApproverAction(approvalRequestObj.approvalRequestId, payload, employeeObj.kerberos);
                if ( result.notApproved && result.notApproved.error ) {
                    result.error = true;
                    return
                }
            }

            if(act.action == 'Canceled'){
                let payload = {action: 'cancel', comments};
                result.canceled = await approvalRequest.doRequesterAction(approvalRequestObj.approvalRequestId, payload);
                if ( result.canceled && result.canceled.error ) {
                    result.error = true;
                    return
                }
            }

            if(act.action == 'Pending'){
                let payload = {action: 'approval-needed', comments};
                result.pending = await approvalRequest.doApproverAction(approvalRequestObj.approvalRequestId, payload, employeeObj.kerberos);
                if ( result.pending && result.pending.error ) {
                    result.error = true;
                    return
                }
            }

            // bigsys does not track changes to form, so no sense in resubmitting in the new system since it will be the same
            if(act.action == 'Resubmit' && false){
                let payload = {action: 'recall', comments};
                result.resubmit = await approvalRequest.doRequesterAction(approvalRequestObj.approvalRequestId, payload);
                if ( result.resubmit && result.resubmit.error ) {
                    result.error = true;
                    return
                }
            }
        }

        return result;
    }

    formatText(text){
        text = text || '';

        //unescape ampersand
        text = text.replace(/&amp;/g, '&');

        // quote
        text = text.replace(/&quot;/g, '"');

        return text;
    }

    transformLocation(bigsysLocation) {
      const map = {
        'In-State': 'in-state',
        'Out-of-State': 'out-of-state',
        'Foreign': 'foreign'
      }
      return map[bigsysLocation] || 'in-state';
    }

    async formatJson(row, funded, exp){
        let nRow = {
            "approvalStatus": "draft",
            "reimbursementStatus": "not-submitted",
            "label": this.formatText(row.event_name),
            "organization": this.formatText(row.event_organizer),
            "businessPurpose": 'None provided.',
            "releaseTime": row.release_time || 0,
            "location": this.transformLocation(row.event_instate),
            "locationDetails": this.formatText(row.event_location),
            "comments": this.formatText(row.staff_comments),
            "programStartDate": new Intl.DateTimeFormat("fr-CA", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    timeZone: "UTC",
                                }).format(row.event_date),
            "programEndDate": new Intl.DateTimeFormat("fr-CA", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    timeZone: "UTC",
                                }).format(row.event_end)
        }

        if(row.travel_date) {
            nRow["travelRequired"] = true;
            nRow["hasCustomTravelDates"] = true;
            nRow["travelStartDate"] =  new Intl.DateTimeFormat("fr-CA", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            timeZone: "UTC",
                                        }).format(row.travel_date);

            nRow["travelEndDate"] =  new Intl.DateTimeFormat("fr-CA", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        timeZone: "UTC",
                                    }).format(row.travel_end);
        }


        nRow['fundingSources'] = await this.formatFunding(row, funded);
        nRow['expenditures'] = await this.formatExpenditures(row, exp);

        if ( !nRow.expenditures.length ) {
          nRow.noExpenditures = true;
          nRow.reimbursementStatus = 'not-required';
        }

        return nRow;

    }



    async formatFunding(row, funded){
        let fundsCollection = [];

        //Department Funding
        if(row.fund_request_depthead){
            const result = funded.filter((fund) => fund.funding_source_id == 4)[0];
            let obj = {
                "fundingSourceId": result.funding_source_id,
                "amount": 0,
                "description": '',
                "requireDescription": result.require_description
            }
            fundsCollection.push(obj);

        }

        //Represented Librarian Professional Development
        if(row.fund_request_profdev){
            const result = funded.filter((fund) => fund.funding_source_id == 1)[0];
            let obj = {
                "fundingSourceId": result.funding_source_id,
                "amount": row.approve_profdev_amount ? row.approve_profdev_amount : 0,
                "description": '',
                "requireDescription": result.require_description
            }
            fundsCollection.push(obj);

        }

        //Administrative Funding
        if(row.fund_request_admin){
            const result = funded.filter((fund) => fund.funding_source_id == 6)[0];
            let obj = {
                "fundingSourceId": result.funding_source_id,
                "amount": row.approve_admin_amount ? row.approve_admin_amount : 0,
                "description": '',
                "requireDescription": result.require_description
            }
            fundsCollection.push(obj);


        }

        //Grant
        if(row.fund_request_grant){
            const result = funded.filter((fund) => fund.funding_source_id == 3)[0];
            let obj = {
                "fundingSourceId": result.funding_source_id,
                "amount": row.approve_grant_amount ? row.approve_grant_amount : 0,
                "description": '',
                "requireDescription": result.require_description
            }
            fundsCollection.push(obj);

        }

        //LAUC-D or Statewide LAUC
        if(row.fund_request_lauc){
            const result = funded.filter((fund) => fund.funding_source_id == 2)[0];
            let obj = {
                "fundingSourceId": result.funding_source_id,
                "amount": row.approve_lauc_amount ? row.approve_lauc_amount : 0,
                "description": '',
                "requireDescription": result.require_description
            }
            fundsCollection.push(obj);

        }

        //Other Funding
        if(row.fund_request_external ||
           row.fund_request_yearend ||
           row.fund_request_pac ||
           row.fund_request_training ){
            const result = funded.filter((fund) => fund.funding_source_id == 7)[0];
            let obj = {
                "fundingSourceId": result.funding_source_id,
                "amount": row.fund_request_external_amount ? row.fund_request_external_amount : 0,
                "description": '',
                "requireDescription": result.require_description
            }
            fundsCollection.push(obj);
        }

        //No funding/program time only
        if(row.fund_request_none){
            const result = funded.filter((fund) => fund.funding_source_id == 8)[0];

            let obj = {
                "fundingSourceId": result.funding_source_id,
                "amount": 0,
                "description": '',
                "requireDescription": result.require_description
            }
            fundsCollection.push(obj);

        }

        return fundsCollection;
    }

    async formatExpenditures(row, exp){
        let expCollection = [];
        // let exp = await conn.query('SELECT * FROM expenditure_option');

        // Registration Fees
        if(row.exp_fees != '0.00'){
            const result = exp.filter((exp) => exp.expenditure_option_id == 1)[0];

            let obj = {
                "expenditureOptionId": result.expenditure_option_id,
                "amount": row.exp_fees
            }
            expCollection.push(obj);
        }
        // Airfare
        if(row.exp_fares != '0.00'){
            const result = exp.filter((exp) => exp.expenditure_option_id == 2)[0];
            let obj = {
                "expenditureOptionId": result.expenditure_option_id,
                "amount": row.exp_fares
            }
            expCollection.push(obj);
        }

        // Lodging
        if(row.exp_lodging != '0.00'){
            const result = exp.filter((exp) => exp.expenditure_option_id == 3)[0];
            let obj = {
                "expenditureOptionId": result.expenditure_option_id,
                "amount": row.exp_lodging
            }
            expCollection.push(obj);
        }

        // Meals/Incidentals
        if(row.exp_meals != '0.00'){
            const result = exp.filter((exp) => exp.expenditure_option_id == 4)[0];
            let obj = {
                "expenditureOptionId": result.expenditure_option_id,
                "amount": row.exp_meals
            }
            expCollection.push(obj);
        }


        // Ground Transportation
        if(row.exp_berkeley_num){
            const result = exp.filter((exp) => exp.expenditure_option_id == 5)[0];
            let obj = {
                "expenditureOptionId": result.expenditure_option_id,
                "amount": row.exp_berkeley_num
            }
            expCollection.push(obj);
        }

        if(row.exp_libraryvan){
            const result = exp.filter((exp) => exp.expenditure_option_id == 5)[0];
            let obj = {
                "expenditureOptionId": result.expenditure_option_id,
                "amount": row.exp_ucdvehicle
            }
            expCollection.push(obj);
        }

        // Personal Car Mileage
        if(row.exp_vehicle_miles){
            const result = exp.filter((exp) => exp.expenditure_option_id == 6)[0];
            let obj = {
                "expenditureOptionId": result.expenditure_option_id,
                "amount": row.exp_vehicle_miles
            }
            expCollection.push(obj);
        }

        // Miscellaneous
        if(row.exp_misc != '0.00'){
            const result = exp.filter((exp) => exp.expenditure_option_id == 7)[0];
            let obj = {
                "expenditureOptionId": result.expenditure_option_id,
                "amount": row.exp_misc
            }
            expCollection.push(obj);
        }

        return expCollection;
    }


   // Run MySQL query
    async runMySQLQuery(year='', single='') {
      let yearFilter = '1=1';
      if ( year ) {
        const fy = fiscalYearUtils.fromStartYear(year);
        const start = fy.startDate({isoDate: true});
        const end = fy.endDate({isoDate: true});
        yearFilter = `f.event_date BETWEEN '${start}' AND '${end}'`;
      }
        const idFilter = single ? `f.id = ${single}` : '1=1'; // '1=1' for no filter

            try {
                const connection = await this.connectToMySQLDatabase();

                const sql = `
                SELECT
                    f.*,
                    (SELECT
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'activityHistoryId', h.id,
                                'formId', h.forms_id,
                                'userId', h.userid,
                                'name', h.name,
                                'relation', h.relation,
                                'action', h.action,
                                'approveProfdevAmount', h.approve_profdev_amount,
                                'approveAdminAmount', h.approve_admin_amount,
                                'approveAdminReason', h.approve_admin_reason,
                                'approveExternalAmount', h.approve_external_amount,
                                'approveLaucAmount', h.approve_lauc_amount,
                                'approveGrantAmount', h.approve_grant_amount,
                                'approveFund1Name', h.approve_fund1_name,
                                'approveFund1Amount', h.approve_fund1_amount,
                                'approveFund2Name', h.approve_fund2_name,
                                'approveFund2Amount', h.approve_fund2_amount,
                                'comments', h.comments,
                                'submitted', h.submitted,
                                -- Subquery for the employee information
                                'employee', (SELECT
                                    JSON_ARRAYAGG(
                                        JSON_OBJECT(
                                            'id', au.id,
                                            'userId', au.userid,
                                            'userName', au.username,
                                            'kerberosId', au.kerberos_id,
                                            'lastName', au.lastname,
                                            'firstName', au.firstname,
                                            'middleInitial', au.middleinitial,
                                            'email', au.email,
                                            'phone', au.phone,
                                            'webpage', au.webpage,
                                            'active', au.active,
                                            'startDate', au.startdate,
                                            'endDate', au.enddate
                                        )
                                    )
                                    FROM
                                        directory.lib_user au
                                    WHERE
                                        au.id = h.userid
                                )
                            )
                        )
                        FROM
                            travel.history h
                        WHERE
                            h.forms_id = f.id
                    ) AS activity_history,

                    -- Subquery for lib_user information
                    (SELECT
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', u.id,
                                'userId', u.userid,
                                'userName', u.username,
                                'kerberosId', u.kerberos_id,
                                'lastName', u.lastname,
                                'firstName', u.firstname,
                                'middleInitial', u.middleinitial,
                                'email', u.email,
                                'phone', u.phone,
                                'webpage', u.webpage,
                                'active', u.active,
                                'startDate', u.startdate,
                                'endDate', u.enddate
                            )
                        )
                        FROM
                            directory.lib_user u
                        WHERE
                            u.id = f.userid
                    ) AS lib_user
                    FROM
                        travel.forms f
                    WHERE
                        ${yearFilter}
                        AND ${idFilter}
                    ORDER BY
                        f.id ASC;
                `;

                // Simple query to test the connection
                const [rows] = await connection.query(sql);

                await connection.release();
                return rows;

            } catch (error) {
                console.error('Error connecting to the database:', error);
            }
    }

    // Create a connection to the MySQL and Postgres database
    async convertData(year='', single='') {
        const rows = await this.runMySQLQuery(year, single);

        let errorsOccured = await this.insertIntoPostgresDatabase(rows);
        const summary = {
          'totalForms': rows.length,
          'totalErrors': errorsOccured.length
        }
        log.log("Summary:\n\n", summary);

        log.log("Some Errors have occured:\n\n", errorsOccured);

        return;
    }

}

export default new Migration();
