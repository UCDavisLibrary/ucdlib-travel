import { LitElement } from 'lit';
import {render, styles} from "./app-toast.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";


/**
 * @description Component for handling sitewide toast 
 * 
 
   this.AppStateModel.showToast(object);
 */
export default class AppToast extends Mixin(LitElement)
.with(LitCorkUtils)  {

  static get properties() {
    return {
      item: {type: Object, attribute: 'item'},
      text: {type: String, attribute: 'text'},
      type: {type: String, attribute: 'type'},
      nopopup:{type: Boolean, attribute: 'nopopup'},
      amount: {type: Number, attribute: 'amount'},
      hidden: {type: Boolean},
      animation: {type: Boolean},
      time: {type: Number, attribute: 'time'}

    }
  }

  static get styles() {
    return styles();
  }


  constructor() {
    super();
    this.render = render.bind(this);
    this.hidden=true;
    this.popup=false;
    this.queue = [];
    this.animations;
    this.time = 5000;
    this._injectModel('AppStateModel');

  }

   /**
   * @description Attached to AppStateModel toast-update event
   * @param {Object} options
   */
    _onToastUpdate(items){
      this.hidden = false;

      this.queue.push(items)
      this.queueAmount = this.queue.length;

      for (let i in this.queue){
        
        setTimeout(() => {
          this.animation = true;
          let item = this.queue.shift();
          this.item = Object.assign({}, this.item, item);
          if ( !this.item.message ) return;
          
          this.text = this.item.message;
          this.type = this.item.type || 'information';
            
          this.queueAmount--;
          if(this.queueAmount == 0) {
            setTimeout(() => {
              this.animation = false;
            }, this.time );
          }
        }, this.time * i );
      }
    }
}

customElements.define('app-toast', AppToast);