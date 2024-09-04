import employeeModel from './employee.js';
import departmentModel from './department.js';
import IamEmployeeObjectAccessor from "../utils/iamEmployeeObjectAccessor.js";

class Reports {

  constructor(){}

  /**
   * @description Get the access level of the user
   * @param {AccessToken} token - The user's access token
   * @returns {Object} {hasAccess: Boolean, departmentRestrictions: Array}
   * - hasAccess: Boolean - Whether the user has access to the reports
   * - departmentRestrictions: Array - An array of department ids that the user has access to. If empty, the user has access to all departments.
   */
  async getAccessLevel(token){
    const out = {
      hasAccess: false,
      departmentRestrictions: [],
    };

    if ( token.canAccessReports ){
      out.hasAccess = true;
      return out;
    }

    let employee = await employeeModel.getIamRecordById(token.id)
    if ( employee.error ) {
      return employee;
    }

    employee = new IamEmployeeObjectAccessor(employee.res);
    if ( !employee.isDepartmentHead ){
      return out;
    }

    out.hasAccess = true;
    out.departmentRestrictions.push(employee.department.id)

    const descendantDepartments = await departmentModel.getAllDescendantDepartments(employee.department.id);
    if ( descendantDepartments.error ) {
      return descendantDepartments;
    }
    out.departmentRestrictions.push(...descendantDepartments.map(department => department.id));

    return out;
  }
}

export default new Reports();
