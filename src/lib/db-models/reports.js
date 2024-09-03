import employeeModel from './employee.js';
import IamEmployeeObjectAccessor from "../utils/iamEmployeeObjectAccessor.js";

class Reports {

  constructor(){}

  async getAccessLevel(token){
    const out = {
      hasAccess: false,
      departmentRestrictions: [],
    };

    // todo: uncomment when testing is complete
    // if ( token.canAccessReports ){
    //   out.hasAccess = true;
    //   return out;
    // }

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

    // todo: get all child departments


    return out;
  }
}

export default new Reports();
