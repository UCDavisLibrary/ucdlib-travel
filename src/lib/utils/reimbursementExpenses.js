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
          hideFromHydration: true,
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

  /**
   * @description Hydrate the transportation expenses from the reimbursement request
   * @param {Array} expenses - The expenses array from the reimbursement request
   * @returns {Object} - The total expenses and an array of expenses
   * Formatted for easy rendering in a table
   */
  hydrateTransportationExpenses(expenses=[]){
    const out = { total: 0, totalString: '0.00', expenses: [], label: this.transportation.label };
    if ( !Array.isArray(expenses) ) return out;

    const subCategories = this.transportation.subCategories;

    for (const expense of expenses.filter(e => e.category === 'transportation')) {
      const e = {
        reimbursementRequestExpenseId: expense.reimbursementRequestExpenseId,
        category: expense?.details?.subCategory || '',
      };
      if ( !subCategories.find(s => s.value === e.category) ) continue;
      e.categoryLabel = subCategories.find(s => s.value === e.category).label;

      let amount = Number(expense.amount);
      if ( isNaN(amount) ) continue;
      e.amount = amount;
      out.total += amount;
      e.amountString = amount.toFixed(2);

      e.from = expense?.details?.from || '';
      e.to = expense?.details?.to || '';
      e.oneWay = expense?.details?.oneWay ? true : false;
      let estimatedMiles = Number(expense?.details?.estimatedMiles);
      e.estimatedMiles = isNaN(estimatedMiles) ? 0 : estimatedMiles;

      out.expenses.push(e);
    }

    out.totalString = out.total.toFixed(2);
    return out;
  }

  /**
   * @description Hydrate the registration fee expenses from the reimbursement request
   * @param {Array} expenses - The expenses array from the reimbursement request
   * @returns {Object} - The total expenses and an array of expenses
   * Formatted for easy rendering in a table
   */
  hydrateRegistrationFeeExpenses(expenses=[]){
    const out = { total: 0, totalString: '0.00', expenses: [], label: this.registrationFee.label };
    if ( !Array.isArray(expenses) ) return out;

    for (const expense of expenses.filter(e => e.category === 'registration-fee')) {
      const e = {
        reimbursementRequestExpenseId: expense.reimbursementRequestExpenseId
      };

      let amount = Number(expense.amount);
      if ( isNaN(amount) ) continue;
      e.amount = amount;
      out.total += amount;
      e.amountString = amount.toFixed(2);

      e.name = expense?.details?.name || 'Untitled';
      out.expenses.push(e);
    }

    out.totalString = out.total.toFixed(2);

    return out;
  }

  hydrateDailyExpenses(expenses=[]){
    if ( !Array.isArray(expenses) ) return out;
    const out = { total: 0, totalString: '0.00', dates: [], label: this.dailyExpense.label };
    out.subCategories = this.dailyExpense.subCategories.filter(s => !s.hideFromHydration).map(s => {
      return {
        ...s,
        amount: 0,
      }
    });
    for (const expense of expenses.filter(e => e.category === 'daily-expense')) {
      if ( !expense.date ) continue;
      if ( !out.dates.find(d => d.date === expense.date) ){
        const dailyExpenses = this.dailyExpense.subCategories.filter(s => !s.hideFromHydration).map(s => {
          return {
            ...s,
            amount: 0,
          }
        });
        out.dates.push({ date: expense.date, expenses: dailyExpenses, total: 0 });
      }
      const date = out.dates.find(d => d.date === expense.date);

      const dailyExpense = date.expenses.find(e => e.value === expense?.details?.subCategory);
      if ( !dailyExpense ) continue;

      let amount = Number(expense.amount);
      if ( isNaN(amount) ) continue;

      dailyExpense.amount += amount;
      date.total += amount;
      out.total += amount;

      const subCategory = out.subCategories.find(s => s.value === expense?.details?.subCategory);
      if ( subCategory ) subCategory.amount += amount;

      if ( !date.notes && expense.notes ) date.notes = expense.notes;
    }

    out.totalString = out.total.toFixed(2);
    out.dates.forEach(d => {
      d.totalString = d.total.toFixed(2);
      d.expenses.forEach(e => {
        e.amountString = e.amount.toFixed(2);
      });
    });
    out.subCategories.forEach(s => {
      s.amountString = s.amount.toFixed(2);
    });

    out.dates.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    return out;
  }
}

export default new ReimbursementExpenses();
