import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";
import validations from "./approvalRequestValidations.js";
import employeeModel from "./employee.js";

class ApprovalRequest {

  constructor(){

    this.validations = new validations(this);

    this.entityFields = new EntityFields([
      {
        dbName: 'approval_request_revision_id',
        jsonName: 'approvalRequestRevisionId',
        validateType: 'integer'
      },
      {
        dbName: 'approval_request_id',
        jsonName: 'approvalRequestId',
        validateType: 'integer',
        customValidationAsync: this.validations.approvalRequestId.bind(this.validations)
      },
      {
        dbName: 'is_current',
        jsonName: 'isCurrent',
        validateType: 'boolean'
      },
      {
        dbName: 'approval_status',
        jsonName: 'approvalStatus',
        customValidation: this.validations.approvalStatus.bind(this.validations),
      },
      {
        dbName: 'reimbursement_status',
        jsonName: 'reimbursementStatus',
        required: true,
        customValidation: this.validations.reimbursementStatus.bind(this.validations)
      },
      {
        dbName: 'employee_kerberos',
        jsonName: 'employeeKerberos'
      },
      {
        dbName: 'employee',
        jsonName: 'employee',
        customValidation: this.validations.employee.bind(this.validations)
      },
      {
        dbName: 'label',
        jsonName: 'label',
        charLimit: 100,
        customValidation: this.validations.requireIfNotDraft.bind(this.validations)
      },
      {
        dbName: 'organization',
        jsonName: 'organization',
        charLimit: 100,
        customValidation: this.validations.requireIfNotDraft.bind(this.validations)
      },
      {
        dbName: 'business_purpose',
        jsonName: 'businessPurpose',
        charLimit: 500,
        customValidation: this.validations.requireIfNotDraft.bind(this.validations)
      },
      {
        dbName: 'location',
        jsonName: 'location',
        customValidation: this.validations.location.bind(this.validations)
      },
      {
        dbName: 'location_details',
        jsonName: 'locationDetails',
        charLimit: 100,
        customValidation: this.validations.locationDetails.bind(this.validations)
      },
      {
        dbName: 'program_start_date',
        jsonName: 'programStartDate',
        validateType: 'date',
        customValidation: this.validations.programDate.bind(this.validations)
      },
      {
        dbName: 'program_end_date',
        jsonName: 'programEndDate',
        validateType: 'date',
        customValidation: this.validations.programDate.bind(this.validations)
      },
      {
        dbName: 'travel_required',
        jsonName: 'travelRequired',
        validateType: 'boolean'
      },
      {
        dbName: 'has_custom_travel_dates',
        jsonName: 'hasCustomTravelDates',
        validateType: 'boolean'
      },
      {
        dbName: 'travel_start_date',
        jsonName: 'travelStartDate',
        validateType: 'date',
        customValidation: this.validations.travelDate.bind(this.validations)
      },
      {
        dbName: 'travel_end_date',
        jsonName: 'travelEndDate',
        validateType: 'date',
        customValidation: this.validations.travelDate.bind(this.validations)
      },
      {
        dbName: 'comments',
        jsonName: 'comments',
        charLimit: 500
      },
      {
        dbName: 'submitted_at',
        jsonName: 'submittedAt',
      },
      {
        dbName: 'no_expenditures',
        jsonName: 'noExpenditures',
        validateType: 'boolean'
      },
      {
        dbName: 'expenditures',
        jsonName: 'expenditures',
        validateType: 'array',
        customValidationAsync: this.validations.expenditures.bind(this.validations)
      },
      {
        dbName: 'funding_sources',
        jsonName: 'fundingSources',
        validateType: 'array',
        customValidationAsync: this.validations.fundingSources.bind(this.validations)
      }
    ]);

    this.fundingSourceFields = new EntityFields([
      {
        dbName: 'approval_request_funding_source_id',
        jsonName: 'approvalRequestFundingSourceId'
      },
      {
        dbName: 'approval_request_revision_id',
        jsonName: 'approvalRequestRevisionId'
      },
      {
        dbName: 'funding_source_id',
        jsonName: 'fundingSourceId'
      },
      {
        dbName: 'amount',
        jsonName: 'amount'
      },
      {
        dbName: 'accounting_code',
        jsonName: 'accountingCode'
      },
      {
        dbName: 'description',
        jsonName: 'description'
      }
    ]);
  }

  async createRevision(data, submittedBy){

    // if submittedBy is provided, assign approval request revision to that employee
    if ( submittedBy ){
      data.employee = submittedBy;
      delete data.employeeKerberos;
    }

    data = this.entityFields.toDbObj(data);

    // remove system generated fields
    delete data.approval_request_revision_id;
    delete data.is_current;
    delete data.submitted_at

    // do validation
    const validation = await this.entityFields.validate(data, ['employee_allocation_id']);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    // extract employee object from data
    data.employee_kerberos = data.employee.kerberos || data.employee.kerberos;
    const employee = data.employee.kerberos ? {kerberos: data.employee.kerberos} : data.employee;
    delete data.employee;

    // start transaction
    let out = {};
    let approvalRequestRevisionId;
    const fundingSources = data.funding_sources || [];
    delete data.funding_sources;
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      // upsert employee and department
      await employeeModel.upsertInTransaction(client, employee);

      // mark any previous revisions as not current
      if ( data.approval_request_id ){
        const sql = `UPDATE approval_request SET is_current = false WHERE approval_request_id = $1`;
        await client.query(sql, [data.approval_request_id]);
      }

      // insert approval request revision
      data = pg.prepareObjectForInsert(data);
      const sql = `INSERT INTO approval_request (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING approval_request_revision_id`;
      const res = await client.query(sql, data.values);
      approvalRequestRevisionId = res.rows[0].approval_request_revision_id;

      // insert funding sources
      if ( !data.no_expenditures ){
        for (let fs of fundingSources){
          fs.approvalRequestRevisionId = approvalRequestRevisionId;
          fs = this.fundingSourceFields.toDbObj(fs);
          fs = pg.prepareObjectForInsert(fs);
          const sql = `INSERT INTO approval_request_funding_source (${fs.keysString}) VALUES (${fs.placeholdersString})`;
          await client.query(sql, fs.values);
        }
      }

      // insert expenditures
      if ( !data.no_expenditures ){
        // todo
      }


      await client.query('COMMIT');

    } catch (e) {
        await client.query('ROLLBACK');
        out = {error: e};
    } finally {
      client.release();
    }

    if ( out.error ) return out;

    out = approvalRequestRevisionId;

    return out;

  }

}

export default new ApprovalRequest();
