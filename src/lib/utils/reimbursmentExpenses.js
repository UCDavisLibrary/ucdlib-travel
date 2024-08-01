class ReimbursementExpenses {

  get transportation() {

    return {
      label: 'Transportation Expenses',
      value: 'transportation',
      requiredDetails: this.getDetailsFields(['from', 'to']),
      subCategories: [
        {
          label: 'Private Car',
          value: 'private-car',
          requiredDetails: this.getDetailsFields(['estimatedMiles']),
        },
        {
          label: 'Airfare/train',
          value: 'airfare-train',
        },
        {
          label: 'Rental Car',
          value: 'rental-car',
        },
      ]
    }
  }

  get registrationFee(){
    return {
      label: 'Registration/Membership Fees',
      value: 'registration-fee',
      subCategories: [],
      requiredDetails: this.getDetailsFields(['name'])
    }
  }

  get dailyExpense(){
    return {
      label: 'Daily Expenses',
      value: 'daily-expense',
      requiredDetails: [],
      subCategories: [
        {
          label: 'Meals',
          value: 'meals',
          hideFromSelect: true,
          description: `Meals and incidentals not reimbursable for travel less than 24 hours without overnight stay, unless meal is integral part of meeting.`
        },
        {
          label: 'Meal - Breakfast',
          shortLabel: 'Breakfast',
          value: 'breakfast',
          parent: 'meals'
        },
        {
          label: 'Meal - Lunch',
          shortLabel: 'Lunch',
          value: 'lunch',
          parent: 'meals'
        },
        {
          label: 'Meal - Dinner',
          shortLabel: 'Dinner',
          value: 'dinner',
          parent: 'meals'
        },
        {
          label: 'Lodging',
          value: 'lodging'
        },
        {
          label: 'Miscellaneous',
          value: 'miscellaneous',
          shortLabel: 'Misc',
          description: `Uber, taxi, airport shuttles, parking, tolls, etc`
        }
      ]
    }
  }

  get allCategories(){
    return [
      this.transportation,
      this.registrationFee,
      this.dailyExpense
    ]
  }

  /**
   * @description Properties that can be in the expense.details object
   */
  get detailsFields(){
    return [
      { value: 'subCategory', label: 'SubCategory' },
      { value: 'from', label: 'From' },
      { value: 'to', label: 'To' },
      { value: 'name', label: 'Name' },
      { value: 'estimatedMiles', label: 'Estimated Miles' }
    ]
  }

  getDetailsFields(values){
    return this.detailsFields.filter(f => values.includes(f.value));
  }

  /**
   * @description Add up the total expenses from the reimbursement request
   * @param {Object} reimbursementRequest - The reimbursement request object
   * @returns {Number} - The total expenses
   */
  addExpenses(reimbursementRequest){
    let expenses = [];
    if ( Array.isArray(reimbursementRequest) ){
      expenses = reimbursementRequest;
    } else {
      expenses = Array.isArray(reimbursementRequest?.expenses) ? reimbursementRequest.expenses : [];
    }

    let totalExpenses = (expenses).reduce((total, expense) => {
      let sum = parseFloat(expense?.amount || 0);
      if ( isNaN(sum) ) sum = 0;
      return total + parseFloat(sum);
    }, 0);
    return totalExpenses.toFixed(2);
  }
}

export default new ReimbursementExpenses();
