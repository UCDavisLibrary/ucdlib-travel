import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";
import validations from "./approvalRequestValidations.js";

class ApprovalRequest(){

  constructor(){

    this.entityFields = new EntityFields([
      {
        dbName: 'approval_request_revision_id',
        jsonName: 'approvalRequestRevisionId',
        validateType: 'integer'
      },
      {
        dbName: 'approval_request_id',
        jsonName: 'approvalRequestId',
        validateType: 'integer'
      },
      {
        dbName: 'is_current',
        jsonName: 'isCurrent',
        validateType: 'boolean'
      },
      {
        dbName: 'approval_status',
        jsonName: 'approvalStatus',
        required: true,
        customValidation: validations.approvalStatus.bind(this)
      },
      {
        dbName: 'reimbursement_status',
        jsonName: 'reimbursementStatus',
        required: true,
        customValidation: validations.reimbursementStatus.bind(this)
      },
      {
        dbName: 'employee_kerberos',
        jsonName: 'employeeKerberos'
      },
      {
        dbName: 'employee',
        jsonName: 'employee'
      },
      {
        dbName: 'label',
        jsonName: 'label',
        charLimit: 100,
        customValidation: validations.requireIfNotDraft.bind(this)
      },
      {
        dbName: 'organization',
        jsonName: 'organization'
        charLimit: 100,
        customValidation: validations.requireIfNotDraft.bind(this)
      },
      {
        dbName: 'business_purpose',
        jsonName: 'businessPurpose',
        charLimit: 500,
        customValidation: validations.requireIfNotDraft.bind(this)
      },
      {
        dbName: 'location',
        jsonName: 'location',
        customValidation: validations.location.bind(this)
      },
      {
        dbName: 'location_details',
        jsonName: 'locationDetails',
        charLimit: 100,
        customValidation: validations.locationDetails.bind(this)
      }
      {
        dbName: 'program_start_date',
        jsonName: 'programStartDate',
        validateType: 'date',
        customValidation: validations.programDate.bind(this)
      },
      {
        dbName: 'program_end_date',
        jsonName: 'programEndDate',
        validateType: 'date',
        customValidation: validations.programDate.bind(this)
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
        customValidation: validations.travelDate.bind(this)
      },
      {
        dbName: 'travel_end_date',
        jsonName: 'travelEndDate',
        validateType: 'date',
        customValidation: validations.travelDate.bind(this)
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
        customValidationAsync: validations.expenditures.bind(this)
      },
      {
        dbName: 'funding_sources',
        jsonName: 'fundingSources',
        validateType: 'array',
        customValidationAsync: validations.fundingSources.bind(this)
      }
    ]);
  }

}

export default new ApprovalRequest();
