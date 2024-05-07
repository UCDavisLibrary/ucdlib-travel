/**
 * @name IamEmployeeObjectAccessor
 * @description Used to access values and perform transformations on a Library employee IAM object.
 */
export default class IamEmployeeObjectAccessor {
  constructor(iamObject={}) {
    this.data = iamObject;
  }

  /**
   * @description Get simplified object with fields expected by the travel app
   */
  get travelAppObject() {
    const out = {
      kerberos: this.data.user_id || '',
      firstName: this.data.first_name || '',
      lastName: this.data.last_name || '',
    };
    const department = this.department;
    if ( department && department.id ) {
      out.department = {
        departmentId: department.id,
        label: department.name,
        archived: false
      }
    } else {
      out.department = null;
    }

    return out;
  }

  /**
   * @description Get the department of the employee
   */
  get department(){
    for (const group of (this.data.groups || [])) {
      if ( group.partOfOrg ) return group;
    }
  }
}
