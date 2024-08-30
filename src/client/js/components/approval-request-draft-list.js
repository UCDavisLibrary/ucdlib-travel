import { LitElement } from 'lit';
import {render} from "./approval-request-draft-list.tpl.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import urlUtils from '../../../lib/utils/urlUtils.js';

/**
 * @class ApprovalRequestDraftList
 * @description Component that displays draft list for active kerberos id
 *
 * @property {Array} drafts - List of approval request drafts - fetched when init method is called
 * @property {String} kerb - Kerberos id of the logged in user
 * @property {Number} excludeId - Approval request ID to exclude when displaying drafts
 */
export default class ApprovalRequestDraftList extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {
  static get properties() {
    return {
      drafts: {type: Array},
      kerb: {type: String},
      excludeId: {type: Number, attribute: 'exclude-id'}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.drafts = [];
    this._injectModel('AppStateModel', 'ApprovalRequestModel', 'AuthModel');
    this.kerb = this.AuthModel.getToken().token.preferred_username;
    this.query = {employees:this.kerb, approvalStatus:'draft', isCurrent:true}

  }

  /**
   * @description Retrieve necessary data for component
   * @returns {Promise}
   */
     async init(){
      const promises = [
        this.ApprovalRequestModel.query(this.query)
      ];

      return await Promise.allSettled(promises);
    }

    /**
   * @description Attached to approval-requests-fetched event from ApprovalRequestModel
   * Fires when active approval requests are fetched from the server
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
    _onApprovalRequestsRequested(e) {
      if ( e.state !== 'loaded' ) return;

      if(urlUtils.queryObjectToKebabString(this.query) !== e.query) return

      this.drafts = e.payload.data.filter(draft => draft.approvalRequestId !== this.excludeId);

    }

    /**
     * @description Convert date to local date time
     * @param {Date} date
     * @returns
     */
    _toLocalDateTime(date) {
      const d = new Date(date);
      return d.toLocaleString();
    }


}

customElements.define('approval-request-draft-list', ApprovalRequestDraftList);
