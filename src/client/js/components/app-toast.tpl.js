import { html, css } from 'lit';
import {classMap} from 'lit/directives/class-map.js';

export function styles() {
  const elementStyles = css`
    :host {
      position: fixed;
      bottom: 2rem;
      left: 2rem;
      width: 95%;
      z-index: 1000;
    }

    .toast {
      max-width: 90%;
      display: inline-flex;
      padding: 1rem 1.5rem;
      border-radius: 15px;
      background: #FFFFFF;
      box-shadow: 0px 4px 20px 0px #00000033;
      text-align:center;
    }

    @media (min-width: 768px) {
      .toast {
        max-width: 60%;
      }
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
      margin-right: 1rem;
    }

    .type--success {
      color:#3dae2b;
      border: 1px solid #3dae2b;
    }
    .type--info {
      color: #13639e;
      border: 1px solid #13639e;
    }
    .type--error {
      color: #c10230;
      border: 1px solid #c10230;
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
    "type--success": this.type == "success",
    "type--info": this.type == "info",
    "type--error": this.type == "error",

  };
return html`

${!this.nopopup ? html`
    <div class=${classMap(classes)} >
      <span class="icon"> <i>${this.icon}</i></span>
      <span class="text">${this.text}</span>
    </div>

`: html``}

`;}
