/**
 * This file is used to access any globals saved in the window object.
 */

// APP_CONFIG is set in ../static.js in getConfig function
let appConfig = {};
if ( typeof window !== 'undefined' && window.APP_CONFIG ){
  appConfig = window.APP_CONFIG;
}

// mixin is loaded by cork-app-utils
let Mixin;
if ( typeof window !== 'undefined' && window.Mixin ){
  Mixin = window.Mixin;
}

// LitCorkUtils is loaded by cork-app-utils
let LitCorkUtils;
if ( typeof window !== 'undefined' && window.LitCorkUtils ){
  LitCorkUtils = window.LitCorkUtils;
}

export {
  appConfig,
  LitCorkUtils,
  Mixin
}
