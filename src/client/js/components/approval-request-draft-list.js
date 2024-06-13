import { LitElement } from 'lit';
import {render} from "./approval-request-draft-list.tpl.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";

/**
 * @class ApprovalRequestDraftList
 * @description Component that displays draft list for active kerberos id
 *
 * @property {Object} drafts - Object of initial array (only this is needed) and existing array
 * @property {String} kerb - Kerberos from the active page
 * @property {Number} excludeId - ID to exclude from draft list in the existing Object
 */
export default class ApprovalRequestDraftList extends Mixin(LitElement) 
  .with(LitCorkUtils, MainDomElement) {
  static get properties() {
    return {
      drafts: {type: Object},
      kerb: {type: String},
      excludeId: {type: Number, attribute: 'exclude-id'}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.drafts = {edit:[], initial:[]};    

    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'AuthModel');
    this.kerb = this.AuthModel.getToken().token.preferred_username;
  }

  /**
   * @description Retrieve necessary data for component
   * @returns {Promise}
   */
     async init(){
      const promises = [
        this.ApprovalRequestModel.query({employees:this.kerb, status:'draft', isCurrent:true})
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

      if(this.excludeId) {
        this.drafts.edit = [];
        this.drafts.edit = this.drafts.initial.filter((draft) => draft.approvalRequestId !== this.excludeId);

      } else {
        this.drafts.initial = e.payload.data
      }

      this.requestUpdate();
    }


}

customElements.define('approval-request-draft-list', ApprovalRequestDraftList);