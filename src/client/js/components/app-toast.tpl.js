import { html, css } from 'lit';
import {classMap} from 'lit/directives/class-map.js';

export function styles() {
  const elementStyles = css`
    :host {
      position: fixed;
      bottom: 10px;
      left:10px;
    }

    .toast {
      width: 200px;
      display: flex;
      padding: 20px 38px 20px 38px;
      border-radius: 15px;
      background: #FFFFFF;
      box-shadow: 0px 4px 20px 0px #00000033;
      text-align:center;
      z-index:3;
    
    }
    
    .movein {
      -webkit-animation: cssInAnimation 1s forwards; 
      animation: cssInAnimation 1s forwards;
    }
    
    @keyframes cssInAnimation {
      0%   {opacity: 0; display:block;}
      33%   {opacity: 0.25;}
      66%  {opacity: 0.75;}
      100% {opacity: 1;}
    
    }
    @-webkit-keyframes cssInAnimation {
      0%   {opacity: 0; display:block;}
      33%   {opacity: 0.25;}
      66%  {opacity: 0.75;}
      100% {opacity: 1;}
    }
    
    
    .moveout {
      -webkit-animation: cssOutAnimation 1s forwards; 
      animation: cssOutAnimation 1s forwards;
    }
    
    @keyframes cssOutAnimation {
      0%   {opacity: 1;}
      33%   {opacity: 0.75;}
      66%  {opacity: 0.25;}
      100% {opacity: 0; display:none;}
    
    }
    @-webkit-keyframes cssOutAnimation {
      0%   {opacity: 1;}
      33%   {opacity: 0.75;}
      66%  {opacity: 0.25;}
      100% {opacity: 0; display:none;}
    }
    
    .toast-hidden {
      display:none;
    }

    .icon { 
      font-size: 20px;
      width:25%;
    } 

    .text { 
      font-size: 20px;
      width:75%;
    } 

    .icon-success {
      color:#3dae2b;
    }
    .icon-info {
      color:black;
    }     
    .icon-error {
      color: #c10230;
    }

  `;

  return [elementStyles];
}

export function render() { 
  const classes = {
    "toast": !this.hidden,
    "toast-hidden": this.hidden,
    "movein": this.animation,
    "moveout": !this.animation,
    "icon-success": this.type == "success",
    "icon-info": this.type == "info",
    "icon-error": this.type == "error",

  };  
return html`

${!this.nopopup ? html`
    <div class=${classMap(classes)} >
      <span class="icon"> <i>${this.icon}</i></span> 
      <span class="text">${this.text}</span> 
    </div>

`: html``}

`;}