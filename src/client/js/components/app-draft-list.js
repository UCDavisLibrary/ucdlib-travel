import { LitElement } from 'lit';
import {render} from "./app-draft-list.tpl.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";

export default class AppDraftList extends Mixin(LitElement) 
  .with(LitCorkUtils, MainDomElement) {
  static get properties() {
    return {
      drafts: {type: Array},
      kerb: {type: String},
      existingDrafts: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.drafts = [];    
    this.existingDrafts = [];

    this._injectModel('ApprovalRequestModel', 'AuthModel');
    this.kerb = this.AuthModel.getToken().token.preferred_username;
  }

  /**
   * @description Retrieve necessary data for component
   * @returns {Promise}
   */
     async init(){
      const promises = [
        this.ApprovalRequestModel.query({employees:this.kerb})
      ];
  
      return await Promise.allSettled(promises);
    }

    /**
   * @description Attached to approval-requests-fetched event from ApprovalRequestModel
   * Fires when active approval requests are fetched from the server
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
    _onApprovalRequestsFetched(e) {
      if ( e.state !== 'loaded' ) return;
      this.existingDrafts = [];

      if (e.query.includes('request-ids')) {
        const id = e.query.split('=');
        let draftId = this.drafts;
        this.existingDrafts = draftId.filter((draft) => draft.approvalRequestId !== Number(id[1]));
      } else {
        this.drafts = e.payload.data.filter(draft => draft.approvalStatus == "draft");
      }

      this.requestUpdate();
    }


}

customElements.define('app-draft-list', AppDraftList);