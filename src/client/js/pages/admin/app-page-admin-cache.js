import { LitElement } from 'lit';
import {render} from "./app-page-admin-cache.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import { WaitController } from '@ucd-lib/theme-elements/utils/controllers/wait.js';
// import promiseUtils from '../../../../lib/utils/promiseUtils.js';


export default class AppPageAdminCache extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      searchString: {type: String},
      resSearchCache: {type: Array},
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);
    this.waitController = new WaitController(this);

    this.settingsCategory = 'admin-cache';
    this.searchString = '';
    this.type = '';
    this.types = [];
    this.resSearchCache = [];
    this.deleteCacheList = [];

    this._injectModel('AppStateModel', 'CacheModel', 'AuthModel');

  }

    /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;
    this.AppStateModel.showLoading();

    this.AppStateModel.setTitle('Cache Settings');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.admin,
      this.AppStateModel.store.breadcrumbs[this.id]
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);


    const d = await this.getPageData();
    this.logger.info('Page data fetched', d);
    const hasError = d.some(e => e.status === 'rejected' || e.value.state === 'error');
    if( hasError ) {
      this.AppStateModel.showError(d, {ele: this});
      return;
    }

    this.AppStateModel.showLoaded(this.id);

    this.requestUpdate();

  }

  /**
   * @description Bound to CacheModel get-count event.
   * Handles the loading, success, and error states when fetching cache type counts.
   * On success, updates the `types` property with the result data and triggers a re-render.
   * @param {Object} e - Event payload from CacheModel with `state`, `payload`, or `error`.
   */
  async _onGetCount(e){
    if (e.state === 'loading') {
      this.logger.debug('Cache Count are loading...');
    } else if (e.state === 'loaded') {
      this.logger.debug('Cache Count successfully loaded:', e.payload);

      this.types = e.payload.data;
      this.requestUpdate();
    } else if (e.state === 'error') {
      this.logger.debug('Error loading Count:', e.error);
    }
    this.requestUpdate();
  }

  /**
   * @description Get all data required for rendering this page
   */
    async getPageData(){
      const promises = [
        await this.CacheModel.getCount()
      ];
      
      const resolvedPromises = await Promise.allSettled(promises);
      return resolvedPromises;
    }

   /**
   * @description Toggles a cache item in the delete list.
   * If the cache item is already in `deleteCacheList`, it removes it; otherwise, it adds it.
   * Triggers a re-render to reflect the updated selection state in the UI.
   * @param {Object} cache - The cache item to toggle (must contain a unique `id` property).
   */
  toggleCacheSelection(cache) {
    const index = this.deleteCacheList.findIndex(c => c.id === cache.id);
    if (index >= 0) {
      this.deleteCacheList.splice(index, 1); // remove
    } else {
      this.deleteCacheList.push(cache); // add
    }
  
    // Trigger re-render
    this.deleteCacheList = [...this.deleteCacheList];
    this.requestUpdate();
  }


  /**
   * @description Checks whether a given cache item is currently selected for deletion.
   * Compares by `id` against items in `deleteCacheList`.
   * @param {Object} cache - The cache item to check.
   * @returns {boolean} True if the cache item is in `deleteCacheList`, false otherwise.
   */
  isSelected(cache) {
    return this.deleteCacheList.some(c => c.id === cache.id);
  }

    /**
   * @description Handles the CacheModel search-cache event.
   * Updates the component state based on the current load status of the cache search.
   * On success, stores the search results in `resSearchCache` and sets `noResults` if the list is empty.
   * Triggers a UI re-render after handling each state.
   * @param {Object} e - Event object containing the `state`, and either `payload` (on success) or `error`.
   */
  _onSearchCache(e){
    if (e.state === 'loading') {
      // this.logger.debug('Cache Search are loading...');
    } else if (e.state === 'loaded') {
      this.logger.debug('Cache Search Results successfully loaded:', e.payload);
      this.resSearchCache = e.payload.data;
      this.noResults = this.resSearchCache.length == 0 ? true : false;
    } else if (e.state === 'error') {
      this.logger.debug('Error loading Search:', e.error);
    }
    this.requestUpdate();
  }

  /**
   * @description Handles the CacheModel delete-cache event.
   * Responds to loading, success, and error states during cache item deletion.
   * On success, shows a success toast notification. On failure, shows an error toast.
   * Always triggers a UI re-render at the end of the event handling.
   * @param {Object} e - Event object containing the `state`, and either `payload` (on success) or `error`.
   */
  _onDeleteCache(e){
    if (e.state === 'loading') {
      this.logger.debug('Cache Items are deleting...');
    } else if (e.state === 'loaded') {
      this.logger.debug('Cache items successfully deleted:', e.payload);
      this.AppStateModel.showToast({message: 'Cache Items Successfully Deleted', type: 'success'});
    } else if (e.state === 'error') {
      this.logger.debug('Error Deleting Cache Items:', e.error);
      this.AppStateModel.showToast({message: 'Error Deleting Cache Items', type: 'error'});
    }
    this.requestUpdate();
  }

    /**
   * @description clears search string and focuses search input
   * Bound to "Try another search term" link click event
   */
  clearAndFocusSearch(){
    this.searchString = '';
    this.resSearchCache = [];
    this.noResults = false;
    this.renderRoot.querySelector('ucd-theme-search-form').renderRoot.querySelector('input').value = '';
    this.renderRoot.querySelector('ucd-theme-search-form').renderRoot.querySelector('input').focus();
  }

  /**
   * @description Callback for dialog-action AppStateModel event
   * @param {Object} e - AppStateModel dialog-action event
   * @returns
   */
  _onDialogAction(e){
    if ( e.action !== 'delete-cache-items' ) return;
    this._onFormSubmit(e);
  }

 /**
   * @description Handles the form submission to delete selected cache items.
   * If the deletion is successful, it clears the delete list, re-runs the cache search with the current filters,
   * and updates the cache type counts. Shows appropriate toast notifications based on the result.
   * @returns {Promise<void>}
   */
  async _onFormSubmit(){  
    if (!this.deleteCacheList.length) return;
  
    const deleted = await this.CacheModel.deleteCache(this.deleteCacheList);
  
    if (deleted.state === 'error') {
      this.AppStateModel.showToast({
        message: 'Error deleting cache items',
        type: 'error'
      });
      return;
    }
  
    this.deleteCacheList = [];
  
    const s = this.searchString.trim().toLowerCase();
    const search = {};
    if (s) search.query = s;
    if (this.type !== '') search.type = this.type;
  
    await this.CacheModel.searchCache(search);  

    await this.CacheModel.getCount();  

    this.requestUpdate();
  }
  

    /**
   * @description Bound to delete button for each cache item
   * @param {Object} cacheItem - line item object to delete
   */
    _onDeleteClick(e){
      e.preventDefault();

      let cacheItems = this.deleteCacheList;
      this.AppStateModel.showDialogModal({
        title : 'Delete Cache Items',
        content : 'Are you sure you want to delete this cache item entry?',
        actions : [
          {text: 'Delete', value: 'delete-cache-items', color: 'double-decker'},
          {text: 'Cancel', value: 'cancel', invert: true, color: 'primary'}
        ],
        data : {cacheItems}
      });
    }

    /**
   * @description bound to search form search event
   */
    async _onSearch(e){
      this.searchString = e.detail.searchTerm;
      const s = this.searchString.trim().toLowerCase();
      let search = {};

      search.query = s;
      // this.type = "sampleType";


      //add type query
      if(this.type != '') search.type = this.type

      await this.CacheModel.searchCache(search);  
      this.requestUpdate();
    }

}

customElements.define('app-page-admin-cache', AppPageAdminCache);