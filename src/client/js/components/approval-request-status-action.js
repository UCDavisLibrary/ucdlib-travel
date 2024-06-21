import { LitElement } from 'lit';
import {render} from "./approval-request-status-action.tpl.js";

import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";

/**
 * @class ApprovalRequestStatusAction
 * @description UI component for displaying a single approval request status action
 * @property {Object} action - the action object
 *  See approvalRequest DB model for action object structure
 *
 * @emits view-comments - when view comments button is clicked
 */
export default class ApprovalRequestStatusAction extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      action: {type: Object},
      hideCommentsLinks: {type: Boolean, attribute: 'hide-comments-links'},
      showDate: {type: Boolean, attribute: 'show-date'}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);

    this.action = {};
    this.hideCommentsLinks = false;
    this.showDate = false;

    this.byStatus = {
      'approval-needed': {
        label: 'Pending Approval By:',
        iconClass: 'fa-solid fa-user',
        brandColor: 'primary'
      },
      'approve': {
        label: 'Approved By:',
        iconClass: 'fa-solid fa-thumbs-up',
        brandColor: 'redwood'
      },
      'deny': {
        label: 'Denied By:',
        iconClass: 'fa-solid fa-ban',
        brandColor: 'double-decker'
      },
      'cancel': {
        label: 'Canceled By:',
        iconClass: 'fa-solid fa-times',
        brandColor: 'redbud'
      },
      'request-revision': {
        label: 'Revision Requested By:',
        iconClass: 'fa-solid fa-edit',
        brandColor: 'pinot'
      },
      'recall': {
        label: 'Recalled By:',
        iconClass: 'fa-solid fa-rotate-left',
        brandColor: 'secondary'
      },
      'approve-with-changes': {
        label: 'Approved With Changes By:',
        iconClass: 'fa-solid fa-thumbs-up',
        brandColor: 'redwood'
      }
    }
  }

  /**
   * @description bound to view comments button click event
   */
  _onViewCommentsClick() {
    this.dispatchEvent(new CustomEvent('view-comments', {
      detail: this.action
    }));
  }

  /**
   * @description Get the date the action occurred
   * @returns {String}
   */
  _getDate(){
    if ( !this.action.occurred ) return '';
    const d = new Date(this.action.occurred + 'Z');
    if ( isNaN(d.getTime()) ) return '';
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

}

customElements.define('approval-request-status-action', ApprovalRequestStatusAction);
