import {BaseModel} from '@ucd-lib/cork-app-utils';
import EmployeeService from '../services/EmployeeService.js';
import EmployeeStore from '../stores/EmployeeStore.js';

import urlUtils from '../../utils/urlUtils.js';

class EmployeeModel extends BaseModel {

  constructor() {
    super();

    this.store = EmployeeStore;
    this.service = EmployeeService;

    this.register('EmployeeModel');
  }

  /**
   * @description Query the library employee IAM API
   * @param {Object} query - query parameters include:
   * - name: string
   * - department: group id or array of group ids
   * - titleCode: UC PATH title code or array of title codes
   * - page: page number
   * @returns
   */
  async queryIam(query={}){

    const q = {};

    if ( query.name) q.name = query.name;
    if ( query.page ) q.page = query.page;

    let department = urlUtils.sortAndJoin(query.department);
    if( department ) q.department = department;

    let titleCode = urlUtils.sortAndJoin(query.titleCode);
    if ( titleCode ) q['title-code'] = titleCode;

    const queryString = urlUtils.queryStringFromObject(q);

    let state = this.store.data.iamQuery[queryString];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.iamQuery(queryString);
      }
    } catch(e) {}
    return this.store.data.iamQuery[queryString];

  }

  /**
   * @description Get a library employee IAM record by id(s)
   * @param {String|String[]} id - single id or array of ids
   * @param {String} idType - type of id, default 'user-id' aka kerberos. See API endpoint for more options
   * @returns
   */
  async getIamRecordById(id, idType='user-id') {
    id = urlUtils.sortAndJoin(id);
    const cacheKey = this.store.getIamIdKey(id, idType);

    let state = this.store.data.iamById[cacheKey];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.iamQueryById(id, idType);
      }
    } catch(e) {}
    return this.store.data.iamById[cacheKey];
  }

  /**
   * @description Get a list of UC PATH titles that are occupied by current library employees (as primary appointment)
   * @returns
   */
  async getActiveTitles(){
    let state = this.store.data.activeTitles;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getActiveTitles();
      }
    } catch(e) {}
    return this.store.data.activeTitles;
  }

    /**
   * @description Get all employees from the database
   * @returns
   */
  async getAllEmployees(){
    let state = this.store.data.allEmployees;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getAllEmployees();
      }
    } catch(e) {}
    return this.store.data.allEmployees;
  };

}

const model = new EmployeeModel();
export default model;
