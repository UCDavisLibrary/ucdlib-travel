import { LitElement } from 'lit';
// import {render, Templates} from "./app-questions-or-comments.tpl.js";
import * as Templates from "./app-questions-or-comments.tpl.js";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { createRef } from 'lit/directives/ref.js';
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";

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
      comments: {type:String}
    }
  }

  constructor() {
    super();

    this.render = Templates.render.bind(this);


    this.data = {};
    this.comments = '';
    this.actions = [
          {text: 'Submit', value: 'questions-comments-item', color: 'quad'},
          {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
        ];

    this.dialogRef = createRef();

    this._injectModel('AppStateModel', 'NotificationModel');
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
    console.log(e.data);

    // let approverItem = e.data.approver;
    // approverItem.archived = true;

    // await this.AdminApproverTypeModel.update(approverItem);
    this.comments = '';
    this.data = {
      userEmail: '',
      adminEmail: '',
      content: e.data,
      detail: {}
    }


  }
}

customElements.define('app-questions-or-comments', AppQuestionsOrComments);