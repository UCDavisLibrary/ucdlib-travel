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
}

export default new ReimbursementExpenses();
