import { LitElement } from 'lit';
// import {render, Templates} from "./app-questions-or-comments.tpl.js";
import * as Templates from "./app-questions-or-comments.tpl.js";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { createRef } from 'lit/directives/ref.js';
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import AccessToken from '../../../lib/utils/AccessToken.js';

/**
 * @class AppQuestionsOrComments
 * @description Component that either
 * 1. Records a comment from the user
 * 2. Records a question from the user
 * @property {Number} approvalRequestId - Approval Request ID 
 * @property {Number} reimbursementRequestId - Reimbursement ID
 */
export default class AppQuestionsOrComments extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      approvalRequestId: {type: Number, attribute: 'approval-request-id'},
      reimbursementRequestId: {type: Number, attribute: 'reimbursement-request-id'},
      modalTitle: {type: String},
      modalContent: {type: String},
      data: {type: Object},
      comments: {type:String},
      page:{type:String},
    }
  }

  constructor() {
    super();

    this.render = Templates.render.bind(this);

    this.page = "";
    this.data = {};
    this.comments = '';
    this.actions = [
          {text: 'Submit', value: 'questions-comments-item', color: 'quad'},
          {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
        ];
    this.settingsCategory = 'admin-email-settings'
    this.dialogRef = createRef();

    this._injectModel('AppStateModel', 'NotificationModel', 'ApprovalRequestModel', 'AuthModel', 'SettingsModel');
  }

  /**
   * @description Bound to dialog button(s) click event
   * Will emit a dialog-action AppStateModel event with the action value and data
   */
  _onModalClick(){
    this.dialogRef.value.showModal();
  }

  /**
   * @description Bound to dialog button(s) click event
   * Will emit a dialog-action AppStateModel event with the action value and data
   * @param {String} action - The action value to emit
   */
   _onButtonClick(action){
    this.dialogRef.value.close();
    this.AppStateModel.emit('dialog-action', {action, data: this.comments});
   }

  /**
   * @description on dialog action for deleting an approver
   * @param {CustomEvent}
  */
  async _onDialogAction(e){
    if ( e.action !== 'questions-comments-item' ) return;

    let emailCategory = await this.SettingsModel.getByCategory(this.settingsCategory);
    let url;
    this.comments = e.data;
    this.subject = `Comment Added: Request ${this.approvalRequestId}`
    if(this.approvalRequestId) {
        url = `approval-request/${this.approvalRequestId}`
        this.approvalRequest = await this.ApprovalRequestModel.query({requestIds: this.approvalRequestId});
    }
    if(this.reimbursementRequestId) {
        url = `reimbursement/${this.reimbursementRequestId}`
        this.reimbursementRequest = await this.ReimbursementModel.query({requestIds: this.reimbursementRequestId});
    }

    let ap = this.approvalRequest ? this.approvalRequest.payload.data[0] : {};
    let rb = this.reimbursementRequest ? this.reimbursementRequest.payload.data[0] : {};

    this.data = {
        "emailContent": {
          subject: this.subject,
          text: this.comments
        }, //email content 
        "url": url, //url
        "temp": emailCategory.payload, //temporary payload
        "requests": {
          approvalRequestId: ap.approvalRequestRevisionId || null,
          reimbursementRequestId: rr.reimbursementRequestId || null,
        }, //requests could be replaced with id
        notificationType: 'questions-comments' //notification type
    }

    await this.NotificationModel.createNotificationComments(this.data);
  }

  /**
   * @description bound to NotificationModel notification-comments event
   * @param {Object} e - cork-app-utils event
   * @returns
   */
     _onNotificationComments(e) {
      if ( e.state !== 'loaded' ) return;
  
      console.log("Created Notification Comments:", e);
    }
  
}

customElements.define('app-questions-or-comments', AppQuestionsOrComments);