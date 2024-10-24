/**
 * This file is used to access any globals saved in the window object.
 */

// APP_CONFIG is set in ../static.js in getConfig function
let appConfig = {};
if ( typeof window !== 'undefined' && window.APP_CONFIG ){
  appConfig = window.APP_CONFIG;
}

export {
  appConfig
}
