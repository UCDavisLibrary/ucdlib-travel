/**
 * @name EmailVariables
 * @description Used to access values email variable object.
 */

class EmailVariables {
    constructor() {
        this.variables = [
            {name: 'requesterFirstName'},
            {name: 'requesterLastName'},
            {name: 'requesterFullName'},
            {name: 'requesterKerberos'},
            {name: 'requesterLabel'},
            {name: 'requesterOrganization'},
            {name: 'requesterBuisnessPurpose'},
            {name: 'requesterLocation'},
            {name: 'requesterProgramDate'},
            {name: 'requesterTravelDate'},
            {name: 'requesterComments'},
            {name: 'nextApproverFullName'},
            {name: 'nextApproverFundChanges'},
            {name: 'nextApproverKerberos'},
            {name: 'reimbursementLabel'},
            {name: 'reimbursementEmployeeResidence'},
            {name: 'reimbursementTravelDate'},
            {name: 'reimbursementPersonalTime'},
            {name: 'reimbursementComments'},
            {name: 'reimbursementStatus'},
            {name: 'approvalRequestUrl'},
            {name: 'approvalRequestApproverActionUrl'},
            {name: 'reimbursementRequestUrl'}
        ];
    }

    /**
     * @description Get the variable list for email
     */
    get variableList(){
        return this.variables.map(v => v.name);
    }

    /**
     * @description Get requesterFirstName
     */
    get requesterFirstName(){
        return this.variables.find((v) => v.name == 'requesterFirstName').name;
    }

   /**
     * @description Get requesterLastName
     */
    get requesterLastName(){
        return this.variables.find((v) => v.name == 'requesterLastName').name;
    }

    /**
     * @description Get requesterFullName
     */
     get requesterFullName(){
        return this.variables.find((v) => v.name == 'requesterFullName').name;
    }

    /**
     * @description Get requesterKerberos
     */
     get requesterKerberos(){
        return this.variables.find((v) => v.name == 'requesterKerberos').name;
    }

    /**
     * @description Get requesterLabel
     */
     get requesterLabel(){
        return this.variables.find((v) => v.name == 'requesterLabel').name;
    }

    /**
     * @description Get requesterOrganization
     */
     get requesterOrganization(){
        return this.variables.find((v) => v.name == 'requesterOrganization').name;
    }

    /**
     * @description Get requesterBuisnessPurpose
     */
     get requesterBuisnessPurpose(){
        return this.variables.find((v) => v.name == 'requesterBuisnessPurpose').name;
    }

    /**
     * @description Get requesterLocation
     */
     get requesterLocation(){
        return this.variables.find((v) => v.name == 'requesterLocation').name;
    }

    /**
     * @description Get requesterTravelDate
     */
     get requesterTravelDate(){
        return this.variables.find((v) => v.name == 'requesterTravelDate').name;
    }

      /**
     * @description Get requesterProgramDate
     */
       get requesterProgramDate(){
        return this.variables.find((v) => v.name == 'requesterProgramDate').name;
    }

    /**
     * @description Get requesterComments
     */
     get requesterComments(){
        return this.variables.find((v) => v.name == 'requesterComments').name;
    }

    /**
     * @description Get nextApproverFullName
     */
     get nextApproverFullName(){
        return this.variables.find((v) => v.name == 'nextApproverFullName').name;
    }

    /**
     * @description Get nextApproverFundChanges
     */
     get nextApproverFundChanges(){
        return this.variables.find((v) => v.name == 'nextApproverFundChanges').name;
    }

    /**
     * @description Get nextApproverKerberos
     */
     get nextApproverKerberos(){
        return this.variables.find((v) => v.name == 'nextApproverKerberos').name;
    }

    /**
     * @description Get reimbursementLabel
     */
     get reimbursementLabel(){
        return this.variables.find((v) => v.name == 'reimbursementLabel').name;
    }

    /**
     * @description Get reimbursementEmployeeResidence
     */
     get reimbursementEmployeeResidence(){
        return this.variables.find((v) => v.name == 'reimbursementEmployeeResidence').name;
    }

    /**
     * @description Get reimbursementTravelDate
     */
     get reimbursementTravelDate(){
        return this.variables.find((v) => v.name == 'reimbursementTravelDate').name;
    }

    /**
     * @description Get reimbursementPersonalTime
     */
     get reimbursementPersonalTime(){
        return this.variables.find((v) => v.name == 'reimbursementPersonalTime').name;
    }

    /**
     * @description Get reimbursementComments
     */
     get reimbursementComments(){
        return this.variables.find((v) => v.name == 'reimbursementComments').name;
    }

    /**
     * @description Get reimbursementStatus
     */
     get reimbursementStatus(){
        return this.variables.find((v) => v.name == 'reimbursementStatus').name;
    }

    get approvalRequestApproverActionUrl(){
        return this.variables.find((v) => v.name == 'approvalRequestApproverActionUrl').name;
    }

    /**
     * @description Get approvalRequestUrl
     */
     get approvalRequestUrl(){
        return this.variables.find((v) => v.name == 'approvalRequestUrl').name;
    }

    /**
     * @description Get reimbursementRequestUrl
     */
     get reimbursementRequestUrl(){
        return this.variables.find((v) => v.name == 'reimbursementRequestUrl').name;
    }

  }

export default new EmailVariables();

