import { html, LitElement } from 'lit';
import {render, styles} from "./app-toast.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";


/**
 * @description Component for handling sitewide toast
 *
 * item: the object that holds the display text and status
 * text: the text that is displayed
 * type: the status of the toast message
 * nopopup: have the toast not pop up
 * amount: the amount of objects in the queue of items
 * hidden: the modal is hidden
 * animation: queues up the animation
 * time the amount of time the modal stays up
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
    this.icons;
    this.queueAmount;
    this._injectModel('AppStateModel');

  }


   /**
   * @description Attached to AppStateModel toast-update event
   * @param {Object} options
   */
    _onToastUpdate(items){

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
          this.hidden = false;

          if(this.type == "success") this.icon = html`&#10003;`;
          else if(this.type == "error") this.icon = html`&#10005;`;

          this.queueAmount--;
          if(this.queueAmount == 0) {
            setTimeout(() => {
              this.animation = false;
              this.hidden = true;
            }, this.time );
          }
        }, this.time * i );
      }
    }


    /**
   * @description Attached to AppStateModel toast-dismiss event
   * @param {Object} message
   */
     _onToastDismiss(message){

      this.hidden = true;

      this.queue = [];
      this.queueAmount = 0;
      this.text = "";
      this.type = "";
      this.animation = false;
      this.item = {};

      let toast = this.shadowRoot.querySelector(".toast");
      toast.style.display = "none";
      console.log(message.message);


      this.requestUpdate();

    }
}

customElements.define('app-toast', AppToast);
