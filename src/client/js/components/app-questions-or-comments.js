import { LitElement } from 'lit';
import * as Templates from "./app-questions-or-comments.tpl.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { createRef } from 'lit/directives/ref.js';
import { LitCorkUtils, Mixin } from "@ucd-lib/cork-app-utils";

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
    this.subject = '';
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
   * @description Bound to modal button(s) click event
   * Will emit a AppStateModel event with the action value and data of qc
   */
  _onModalClick(){
    this.dialogRef.value.showModal();
  }

  /**
   * @description Bound to dialog button(s) click event
   * Will emit a dialog-action AppStateModel event with the action value and data
   * @param {String} action - The action value to emit
   */
   async _onButtonClick(action){
    this.dialogRef.value.close();

    if ( action !== 'questions-comments-item' ) return;

    let url = window.location.pathname;

    this.data = {
        "emailContent": {
          subject: this.subject,
          text: this.comments
        }, // email content 
        "url": url, // url
        "requests": {
          approvalRequestId: this.approvalRequestId || null,
          reimbursementRequestId: this.reimbursementRequestId || null,
        }, // requests could be replaced with id
        notificationType: 'questions-comments' // notification type
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

      this.AppStateModel.showToast({message: 'Successfully Created a Notification Comment', type: 'success'});  
    }
  
}

customElements.define('app-questions-or-comments', AppQuestionsOrComments);