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
      approvalRequestId: {type: Number},
      reimbursementRequestId: {type: Number},
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

    this.dialogRef = createRef();

    this._injectModel('AppStateModel', 'NotificationModel', 'ApprovalRequestModel', 'AuthModel');
  }

  /**
   * @description Get all data required for rendering this page
   * @return {Promise}
   */
  //  async init(){
  //   const promises = [
  //     this.SettingsModel.getByCategory(this.settingsCategory),
  //     this.ApprovalRequestModel.query({requestIds: this.approvalRequestId})
  //   ];
  //   const resolvedPromises = await Promise.allSettled(promises);
  //   return resolvedPromises;
  // }



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
    let token = await this.AuthModel.getToken().token;
    let adminEmail;
    this.comments = '';
    if(this.approvalRequestId) this.approvalRequest = await this.ApprovalRequestModel.query({requestIds: this.approvalRequestId})
    if(this.reimbursementRequestId) this.reimbursementRequest = await this.ReimbursementModel.query({requestIds: this.reimbursementRequestId})

    this.data = {
      commenterEmail: token.email || '',
      adminEmail: adminEmail || 'sabaggett@ucdavis.edu',
      content: e.data,
      detail: {
        page: this.page,
        request: this.approvalRequest.payload.data || '',
        reimbursement: this.reimbursementRequest || '',
        commenterKerb: token.preferred_username || '',
        requestPage: this.approvalRequestId ? "approval-request/" + this.approvalRequestId : undefined,
        reimbursementPage: this.reimbursementRequestId ? "reimbursement/" + this.approvalRequestId : undefined
      }
    }

    let result = await this.NotificationModel.createNotificationComments(this.data);
    console.log("Result:", result);

  }
}

customElements.define('app-questions-or-comments', AppQuestionsOrComments);