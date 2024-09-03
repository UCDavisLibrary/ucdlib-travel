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

  /**
   * @description Get the kerberos (user_id) of the employee
   */
  get kerberos() {
    return this.data.user_id || '';
  }

  /**
   * @description Get the iamId of the employee
   */
  get iamId() {
    return this.data.iam_id || '';
  }

  /**
   * @description Get the department head iamId of the employee
   */
  get departmentHeadIamId() {
    if ( !this.department ) return '';
    if ( this.department.isHead) return this.iamId;
    return this.data.departmentHead?.iamId || '';
  }

  get isDepartmentHead() {
    return this.department?.isHead;
  }
}
