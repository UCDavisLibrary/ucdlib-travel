import { LitElement } from 'lit';
import {render} from "./travel-toast.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";


/**
 * @description Component for handling sitewide toast 
 * 
 
   this.AppStateModel.showToast(object);
 */
export default class TravelToast extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement)  {

  static get properties() {
    return {
      item: {type: Object, attribute: 'item'},
      text: {type: String, attribute: 'text'},
      type: {type: String, attribute: 'type'},
      nopopup:{type: Boolean, attribute: 'nopopup'},
      amount: {type: Number, attribute: 'amount'},
      hidden: {type: Boolean},

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.hidden=true;
    this.popup=false;
    this.queue = [];
    // this.item = {};
    this._injectModel('AppStateModel');

  }

    /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} e
   */
  async _onAppStateUpdate() {
    // this.hidden = true;


  }

   /**
   * @description Attached to AppStateModel toast-update event
   * @param {Object} options
   */
    _onToastUpdate(items){
      this.hidden = false;

      for (let i in items){
        
        setTimeout(() => {
          document.querySelector(".toast").classList.add("movein");
          let item = items.shift();
          this.item = Object.assign({}, this.item, item);
          if ( !this.item.message ) return;
          
          this.text = this.item.message;
          this.type = this.item.type || 'information';
            
          this.AppStateModel.queueAmount--;
          if(this.AppStateModel.queueAmount == 0) {
            setTimeout(() => {
              document.querySelector(".toast").classList.add("moveout");
            }, 5000 );
          }
        }, 5000 * i );
      }
    }
}

customElements.define('travel-toast', TravelToast);