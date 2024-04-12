import {BaseModel} from '@ucd-lib/cork-app-utils';
import SettingsService from '../services/SettingsService.js';
import SettingsStore from '../stores/SettingsStore.js';

class SettingsModel extends BaseModel {

  constructor() {
    super();

    this.store = SettingsStore;
    this.service = SettingsService;

    this.register('SettingsModel');
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

const model = new SettingsModel();
export default model;
