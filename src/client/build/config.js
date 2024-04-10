import serverConfig from "../../lib/serverConfig.js";


/**
 * @description Shared config values for dist and dev builds
 */
const config = {
  fileName: serverConfig.assetFileNames.js,
  cssFileName: serverConfig.assetFileNames.css,
  entry: '../js/app-main.js',
  publicDir: '../public',
  clientModules: [
    '../node_modules',
  ],
  loaderOptions: {
    css: {
      loader: 'css-loader',
      options : {
        url: false
      }
    },
    scss: {
      loader: 'sass-loader',
      options: {
        sassOptions: {
          includePaths: [
            "node_modules/@ucd-lib/theme-sass",
            "node_modules/breakpoint-sass/stylesheets",
            "node_modules/sass-toolkit/stylesheets"]
        }
      }
    }
  },
};

export default config;
