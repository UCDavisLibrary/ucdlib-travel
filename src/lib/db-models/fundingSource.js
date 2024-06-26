import pg from "./pg.js";
import EntityFields from "../utils/EntityFields.js";
import typeTransform from "../utils/typeTransform.js";

/**
 * @class FundingSource
 * @description Interface for funding_source table
 */
class FundingSource {
  constructor(){
    this.entityFields = new EntityFields([
      {
        dbName: 'funding_source_id',
        jsonName: 'fundingSourceId',
        customValidationAsync: this._validateFundingSourceId.bind(this)
      },
      {
        dbName: 'label',
        jsonName: 'label',
        label: 'Label',
        required: true,
        charLimit: 50
      },
      {
        dbName: 'description',
        jsonName: 'description',
        charLimit: 200
      },
      {
        dbName: 'has_cap',
        jsonName: 'hasCap',
        validateType: 'boolean'
      },
      {
        dbName: 'cap_default',
        jsonName: 'capDefault',
        validateType: 'number',
        customValidation: this._validateCapDefault.bind(this)
      },
      {
        dbName: 'require_description',
        jsonName: 'requireDescription',
        validateType: 'boolean'
      },
      {
        dbName: 'form_order',
        jsonName: 'formOrder',
        validateType: 'integer'
      },
      {
        dbName: 'hide_from_form',
        jsonName: 'hideFromForm'
      },
      {
        dbName: 'archived',
        jsonName: 'archived',
        validateType: 'boolean'
      },
      {
        dbName: 'approver_types',
        jsonName: 'approverTypes',
        customValidationAsync: this._validateApproverTypes.bind(this)
      }
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

  /**
   * @description Update an existing funding source
   * @param {Object} data - complete funding source object with camelCase keys
   * @returns {Object} - {success: true, fundingSourceId} or {error: true, message: 'Error updating funding source'}
   */
  async update(data){

    data = this.entityFields.toDbObj(data);
    const validation = await this.entityFields.validate(data);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    // delete system fields
    const fundingSourceId = data.funding_source_id;
    delete data.funding_source_id;
    delete data.hide_from_form;
    const approverTypes = data.approver_types;
    delete data.approver_types;

    // start transaction
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      // update funding source
      const updateClause = pg.toUpdateClause(data);
      const updateQuery = `
        UPDATE funding_source
        SET ${updateClause.sql}
        WHERE funding_source_id = $${updateClause.values.length + 1}
        RETURNING *
      `;
      const res = await client.query(updateQuery, [...updateClause.values, fundingSourceId]);
      if( res.rowCount !== 1 ) {
        throw new Error('Error updating funding source');
      }

      // update approver types
      await this._updateApproverTypes(client, fundingSourceId, approverTypes);

      await client.query('COMMIT');

    } catch (e) {
      await client.query('ROLLBACK');
      return {error: e, message: 'Error updating funding source'};
    } finally {
      client.release();
    }

    return {success: true, fundingSourceId};
  }

  /**
   * @description Create a new funding source
   * @param {Object} data - complete funding source object with camelCase keys
   * @returns {Object} - {success: true, fundingSourceId} or {error: true, message: 'Error creating funding source'}
   */
  async create(data){
    data = this.entityFields.toDbObj(data);
    const validation = await this.entityFields.validate(data, ['funding_source_id']);
    if ( !validation.valid ) {
      return {error: true, message: 'Validation Error', is400: true, fieldsWithErrors: validation.fieldsWithErrors};
    }

    // delete system fields
    delete data.funding_source_id;
    delete data.hide_from_form;
    const approverTypes = data.approver_types;
    delete data.approver_types;

    // start transaction
    let fundingSourceId;
    const client = await pg.pool.connect();
    try {
      await client.query('BEGIN');

      // insert funding source
      data = pg.prepareObjectForInsert(data);
      const sql = `INSERT INTO funding_source (${data.keysString}) VALUES (${data.placeholdersString}) RETURNING funding_source_id`;
      const res = await client.query(sql, data.values);
      if( res.rowCount !== 1 ) {
        throw new Error('Error creating funding source');
      }
      fundingSourceId = res.rows[0].funding_source_id;

      // update approver types
      await this._updateApproverTypes(client, fundingSourceId, approverTypes);

      await client.query('COMMIT');

    } catch (e) {
      await client.query('ROLLBACK');
      return {error: e, message: 'Error creating funding source'};
    } finally {
      client.release();
    }

    return {success: true, fundingSourceId};
  }

  /**
   * @description Update approver types for a funding source
   * @param {*} client - pg client
   * @param {Number} fundingSourceId - funding source id
   * @param {Array} approverTypes - array of approver types
   */
  async _updateApproverTypes(client, fundingSourceId, approverTypes){

    // delete existing approver type assignments
    const deleteQuery = `DELETE FROM funding_source_approver WHERE funding_source_id = $1`;
    await client.query(deleteQuery, [fundingSourceId]);

    // insert new approver type assignments
    for (const [index, at] of approverTypes.entries()) {
      const query = `
        INSERT INTO funding_source_approver (funding_source_id, approver_type_id, approval_order)
        VALUES ($1, $2, $3)
      `;
      await client.query(query, [fundingSourceId, at.approverTypeId, index]);
    }
  }

  /**
   * @description Validate approver types for a funding source
   * See EntityFields class for parameter descriptions
   * @returns
   */
  async _validateApproverTypes(field, value, out){
    let error;

    // check value is array of objects with approverTypeId property as positive integer
    const approverTypeIds = []
    if( !Array.isArray(value) ) {
      error = {errorType: 'required', message: 'Must be an array of approver types'};
    } else {
      for (const at of value) {
        const approverTypeId = typeTransform.toPositiveInt(at?.approverTypeId);
        if( !approverTypeId ) {
          error = {errorType: 'invalid', message: 'Invalid approver type id'};
          break;
        }
        approverTypeIds.push(approverTypeId);
      }
    }
    if( error ) {
      this.entityFields.pushError(out, field, error);
      return;
    }

    // check there is at least one approver type
    if( approverTypeIds.length === 0 ) {
      this.entityFields.pushError(out, field, {errorType: 'required', message: 'At least one approver type is required'});
      return;
    }

    // check there are no duplicates
    const uniqueIds = [...(new Set(approverTypeIds))];
    if( approverTypeIds.length !== uniqueIds.length ) {
      this.entityFields.pushError(out, field, {errorType: 'duplicate', message: 'An approver type can only be assigned to a funding source once'});
      return;
    }

    // check all approver types exist
    let query = `SELECT approver_type_id FROM approver_type WHERE approver_type_id = ANY($1)`;
    let res = await pg.query(query, [approverTypeIds]);
    if ( res.error || res.res.rowCount !== approverTypeIds.length ) {
      this.entityFields.pushError(out, field, {errorType: 'invalid', message: 'Invalid approver type id'});
      return;
    }
  }

  /**
   * @description Validate a funding source id
   * See EntityFields class for parameter descriptions
   * @returns
   */
  async _validateFundingSourceId(field, value, out){

    const error = {error: 'required', message: 'This funding source does not exist'};

    // check if is a positive integer
    const fundingSourceId = typeTransform.toPositiveInt(value);
    if( !fundingSourceId ) {
      this.entityFields.pushError(out, field, error);
      return;
    }

    // check funding source exists
    const query = `SELECT funding_source_id FROM funding_source WHERE funding_source_id = $1`;
    const res = await pg.query(query, [fundingSourceId]);
    if( res.error || res.res.rowCount === 0 ) {
      this.entityFields.pushError(out, field, error);
    }
  }

  /**
   * @description Validate a funding source cap default value
   * See EntityFields class for parameter descriptions
   * @returns
   */
  _validateCapDefault(field, value, out, payload){
    if ( !payload.has_cap ) return;

    if ( !typeTransform.toPositiveNumber(value) ) {
      this.entityFields.pushError(out, field, {errorType: 'invalid', message: 'Invalid allocation cap'});
    }

  }
}

export default new FundingSource();
