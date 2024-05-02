import { LitElement } from 'lit';
import { render } from "./app-page-home.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
export default class AppPageHome extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel', 'AdminApproverTypeModel');
  }


  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    // this.AppStateModel.showLoading();



    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);



         /* Create */
    // let data = {
    //     "label": "xlabel",
    //     "description": "xdescripton",
    //     "systemGenerated": false,
    //     "hideFromFundAssignment": false,
    //     "archived": false,
    //     "employees": []
    //  };


    let data = {
      "label": "realfinallabel",
      "description": "finaldescripton",
      "systemGenerated": true,
      "hideFromFundAssignment": false,
      "archived": false,
      "employees":[{
        "employeeKerberos":"sbagg",
        "approvalOrder": 77
      }]
     };   
    let sample = await this.AdminApproverTypeModel.create(data);
     console.log(sample);
    // const d = await this.getPageData();
    // const hasError = d.some(e => e.state === 'error');
    // if ( !hasError ) this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Get any data required for rendering this page
   */
  async getPageData(){
    const promises = [];
    //promises.push(this.YourModel.getData());
    const resolvedPromises = await Promise.all(promises);
    return resolvedPromises;
  }


}

customElements.define('app-page-home', AppPageHome);
