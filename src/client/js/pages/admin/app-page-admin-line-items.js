import { LitElement } from 'lit';
import {render} from "./app-page-admin-line-items.tpl.js";
import { LitCorkUtils, Mixin } from "../../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from "@ucd-lib/theme-elements/utils/controllers/wait.js";
import ValidationHandler from "../../utils/ValidationHandler.js";

/**
 * @description Admin page for managing expense line item options
 * aka what the user can select when submitting an approval request
 * @param {Array} lineItems - local copy of active line item objects from LineItemsModel
 */
export default class AppPageAdminLineItems extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      lineItems : {type: Array},
      newLineItem : {type: Object},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'admin-line-items';
    this.lineItems = [];
    this.newLineItem = {};

    this.waitController = new WaitController(this);

    this._injectModel('AppStateModel', 'SettingsModel', 'LineItemsModel');
  }

  /**
   * @description lit lifecycle method
   */
  willUpdate(changedProps) {
    if ( changedProps.has('newLineItem') ) {
      this.showNewLineItemForm = this.newLineItem && Object.keys(this.newLineItem).length > 0;
    }
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Line Items');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    try {
      const d = await this.getPageData();
      const hasError = d.some(e => e.state === 'error');
      if ( !hasError ) this.AppStateModel.showLoaded(this.id);
      this.requestUpdate();
    } catch(e) {
      this.AppStateModel.showError(this.id);
    }

  }

  /**
   * @description bound to LineItemsModel ACTIVE_LINE_ITEMS_FETCHED event
   * fires when active line items are fetched from the server
   */
  _onActiveLineItemsFetched(e){
    if ( e.state !== 'loaded' ) return;
    this.lineItems = e.payload.map(item => {
      item = {...item};
      item.editing = false;
      item.validationHandler = new ValidationHandler();
      return item;
    });
  }

  /**
   * @description bound to edit button for each line item
   */
  _onEditClick(lineItem){
    lineItem.editing = !lineItem.editing;
    this.requestUpdate();
  }

  /**
   * @description bound to add new line item option button
   * Shows the new line item form at the bottom of the list
   */
  async _onNewClick(){
    this.newLineItem = {
      label : '',
      description : '',
      formOrder : 0,
      editing : true,
      validationHandler : new ValidationHandler()
    };
    await this.waitController.waitForUpdate();
    const form = this.renderRoot.querySelector('.new-line-item-form');
    if ( form ) form.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  }

  /**
   * @description bound to cancel button on line item form
   */
  async _onEditCancelClick(lineItem){
    if ( !lineItem.expenditureOptionId ) {
      this.newLineItem = {};
      return;
    }
    lineItem.editing = false;
    lineItem.validationHandler = new ValidationHandler();

    // toss out any changes
    const lineItems = await this.LineItemsModel.getActiveLineItems();
    if ( lineItems.state === 'loaded' ) {
      const ogLineItem = lineItems.payload.find(item => item.expenditureOptionId == lineItem.expenditureOptionId);
      for( let prop in ogLineItem ) {
        lineItem[prop] = ogLineItem[prop];
      }
    }

    this.requestUpdate();
  }

  /**
   * @description bound to input fields in line item form
   */
  _onFormInput(prop, value, lineItem){
    lineItem[prop] = value;
    this.requestUpdate();
  }

  /**
   * @description Returns a line item from the element's lineItems array by expenditureOptionId
   */
  getLineItemById(id){
    return this.lineItems.find(item => item.expenditureOptionId == id);
  }

  /**
   * @description bound to LineItemsModel LINE_ITEM_UPDATED event
   */
  async _onLineItemUpdated(e){
    if ( e.state === 'error' ) {
      if ( e.error?.payload?.is400 ) {
        const expenditureOptionId = e?.payload?.expenditureOptionId;
        const lineItem = this.getLineItemById(expenditureOptionId);
        lineItem.validationHandler = new ValidationHandler(e);
        this.AppStateModel.showLoaded(this.id)
        this.requestUpdate();
        // TODO: show error toast

      } else {
        // TODO: show error toast
        this.AppStateModel.showLoaded(this.id)
      }
      await this.waitController.waitForFrames(3);
      window.scrollTo(0, this.lastScrollPosition);
    } else if ( e.state === 'loading' ) {
      this.AppStateModel.showLoading();

    } else if ( e.state === 'loaded' ) {
      this.AppStateModel.refresh();
      // TODO: show success toast
    }
  }

  /**
   * @description bound to line item form submit event (new or edit line item)
   */
  _onFormSubmit(e){
    e.preventDefault();
    this.lastScrollPosition = window.scrollY;
    const lineItemId = e.target.getAttribute('line-item-id');

    if ( lineItemId ) {
      const lineItem = this.lineItems.find(item => item.expenditureOptionId == lineItemId);
      if ( !lineItem ) {
        console.error('Could not find line item with id', lineItemId);
        // TODO: show error toast
        return;
      }
      this.LineItemsModel.updateLineItem(lineItem);
    }
  }

  /**
   * @description Get all data required for rendering this page
   */
    async getPageData(){
      const promises = [];
      promises.push(this.SettingsModel.getByCategory(this.settingsCategory));
      promises.push(this.LineItemsModel.getActiveLineItems());
      const resolvedPromises = await Promise.all(promises);
      return resolvedPromises;
    }


}

customElements.define('app-page-admin-line-items', AppPageAdminLineItems);
