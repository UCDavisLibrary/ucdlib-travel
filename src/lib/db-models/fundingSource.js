import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";

class FundingSource {
  constructor(){
    this.entityFields = new EntityFields([
      {dbName: 'funding_source_id', jsonName: 'fundingSourceId', required: true},
      {dbName: 'label', jsonName: 'label', label: 'Label', required: true, charLimit: 50},
      {dbName: 'description', jsonName: 'description'},
      {dbName: 'has_cap', jsonName: 'hasCap'},
      {dbName: 'cap_default', jsonName: 'capDefault', validateType: 'number'},
      {dbName: 'require_description', jsonName: 'requireDescription'},
      {dbName: 'form_order', jsonName: 'formOrder', validateType: 'integer'},
      {db_name: 'hide_from_form', jsonName: 'hideFromForm'},
      {dbName: 'archived', jsonName: 'archived'},
      {dbName: 'approver_types', jsonName: 'approverTypes', validateType: 'array'}
    ]);
  }

  /**
   *
   * @param {*} kwargs - optional arguments including:
   * - active: boolean - if true, return only active (non-archived) options
   * - archived: boolean - if true, return only archived options
   * - ids: array|integer - if provided, return only funding sources with these ids
   * @returns
   */
  async get(kwargs={}){
    const whereArgs = {};
    if( kwargs.active ) {
      whereArgs['fs.archived'] = false;
    } else if( kwargs.archived ) {
      whereArgs['fs.archived'] = true;
    }
    if( kwargs.ids ) {
      whereArgs['fs.funding_source_id'] = Array.isArray(kwargs.ids) ? kwargs.ids : [kwargs.ids];
    }
    const whereClause = pg.toWhereClause(whereArgs);
    const query = `
      SELECT
          fs.*,
          json_agg(json_build_object(
              'approverTypeId', at.approver_type_id,
              'label', at.label,
              'systemGenerated', at.system_generated,
              'archived', at.archived,
              'approvalOrder', fsa.approval_order,
              'employees', (
                  SELECT json_agg(json_build_object(
                      'kerberos', e.kerberos,
                      'firstName', e.first_name,
                      'lastName', e.last_name,
                      'approvalOrder', ata.approval_order
                  ) ORDER BY ata.approval_order)
                  FROM approver_type_employee ata
                  JOIN employee e ON ata.employee_kerberos = e.kerberos
                  WHERE ata.approver_type_id = at.approver_type_id
              )
          ) ORDER BY fsa.approval_order) AS approver_types
      FROM
          funding_source fs
      LEFT JOIN
          funding_source_approver fsa ON fs.funding_source_id = fsa.funding_source_id
      LEFT JOIN
          approver_type at ON fsa.approver_type_id = at.approver_type_id
      ${whereClause.sql ? `WHERE ${whereClause.sql}` : ''}
      GROUP BY
          fs.funding_source_id
      ORDER BY
          fs.form_order
    `

    const res = await pg.query(query, whereClause.values);
    if( res.error ) return res;
    return this._prepareResults(res.res.rows);
  }

  /**
   * @description Prepare the results of a fundingSource query for return
   * @param {Object} res - the result of a fundingSource query
   * @returns {Array} - array of fundingSource objects
   */
  _prepareResults(res){
    const fundingSources = this.entityFields.toJsonArray(res);
    for (const fundingSource of fundingSources) {

      if ( !fundingSource.approverTypes ) fundingSource.approverTypes = [];
      fundingSource.approverTypes = fundingSource.approverTypes.filter(at => at.approverTypeId);

      for (const approverType of fundingSource.approverTypes) {
        if ( !approverType.employees ) approverType.employees = [];
        approverType.employees = approverType.employees.filter(e => e.kerberos);
      }
    }
    return fundingSources;
  }
}

export default new FundingSource();
