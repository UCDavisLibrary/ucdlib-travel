class ReimbursementExpenses {

  get transportation() {

    return {
      label: 'Transportation Expenses',
      value: 'transportation',
      subCategories: [
        {label: 'Private Car', value: 'private-car'},
        {label: 'Airfare/train', value: 'airfare-train'},
        {label: 'Rental Car', value: 'rental-car'},
      ]
    }
  }

  get registrationFee(){
    return {
      label: 'Registration/Membership Fees',
      value: 'registration-fee',
      subCategories: []
    }
  }

  get dailyExpense(){
    return {
      label: 'Daily Expenses',
      value: 'daily-expense',
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
          label: 'Meal- Dinner',
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
}

export default new ReimbursementExpenses();
