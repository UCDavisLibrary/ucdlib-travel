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
      action: {type: Object}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);

    this.action = {};

    this.byStatus = {
      'approval-needed': {
        label: 'Pending Approval By:',
        iconClass: 'fa-solid fa-user',
        brandColor: 'primary'
      },
      'approved': {
        label: 'Approved By:',
        iconClass: 'fa-solid fa-check',
        brandColor: 'quad'
      },
      'denied': {
        label: 'Denied By:',
        iconClass: 'fa-solid fa-ban',
        brandColor: 'double-decker'
      },
      'canceled': {
        label: 'Canceled By:',
        iconClass: 'fa-solid fa-times',
        brandColor: 'redbud'
      },
      'revision-requested': {
        label: 'Revision Requested By:',
        iconClass: 'fa-solid fa-edit',
        brandColor: 'pinot'
      },
      'recalled': {
        label: 'Recalled By:',
        iconClass: 'fa-solid fa-rotate-left',
        brandColor: 'secondary'
      },
      'approved-with-changes': {
        label: 'Approved With Changes By:',
        iconClass: 'fa-solid fa-check',
        brandColor: 'quad'
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

}

customElements.define('approval-request-status-action', ApprovalRequestStatusAction);
