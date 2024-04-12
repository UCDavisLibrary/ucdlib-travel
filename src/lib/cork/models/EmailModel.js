import {BaseModel} from '@ucd-lib/cork-app-utils';
import EmailService from '../services/EmailService.js';
import EmailStore from '../stores/EmailStore.js';

class EmailModel extends BaseModel {

  constructor() {
    super();

    this.store = EmailStore;
    this.service = EmailService;

    this.register('EmailModel');
  }

  async getFoo(){
    let state = this.store.data.foo;
    try {
      if ( state.state === 'loading' ){
        await state.request
      } else {
        await this.service.getFoo();
      }
    } catch(e) {}
    return this.store.data.foo;
  }

}

const model = new EmailModel();
export default model;
