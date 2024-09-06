import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @class subsetIcons
 * @description Utility script that subsets font awesome icons in order to reduce bundle size.
 * To use:
 *  1. Add icons you want to include to this.icons object
 *  2. Ensure that font awesome is installed in the client directory
 *  3. Run the script
 *  4. Restart watch process if running app in local development
 */
class subsetIcons {

  constructor() {

    // Add icon names to include in the subset
    // file will be created for each key in this object
    this.icons = {
      'ucdlib-travel': [
        'arrow-down',
        'arrow-down-up-across-line',
        'arrow-left',
        'arrow-up',
        'ban',
        'briefcase',
        'building',
        'calendar',
        'chart-bar',
        'chart-simple',
        'check',
        'circle-arrow-up',
        'circle-arrow-down',
        'circle-chevron-right',
        'circle-exclamation',
        'circle-half-stroke',
        'circle-minus',
        'circle-notch',
        'circle-plus',
        'circle-question',
        'comment',
        'credit-card',
        'diagram-project',
        'edit',
        'exclamation-circle',
        'file-import',
        'file-lines',
        'filter',
        'gear',
        'grip',
        'list',
        'magnifying-glass',
        'money-bill',
        'money-bill-transfer',
        'money-bill-wave',
        'money-check',
        'pen',
        'pen-to-square',
        'plane-up',
        'plus',
        'rotate-left',
        'spinner',
        'spin',
        'times',
        'thumbs-up',
        'trash',
        'trash-can',
        'user',
        'upload',
        'xmark'
      ]
    }

    this.fontAwesomeDir = path.join(__dirname, '../client/node_modules/@fortawesome/fontawesome-free/js');
    this.fontAwesomeFile = path.join(this.fontAwesomeDir, 'all.js');

    this._fileContent = null;
  }


  /**
   * @description Runs the subsetting process.
   * Will create a new file for each key in this.icons object with the respective subset of icons.
   */
  run(){
    this._loadFileContent();
    if ( !this._fileContent ) return;
    for (const [fileName, icons] of Object.entries(this.icons)) {
      const fileContents = this._subSetIcons(icons);
      this._writeNewFileContent(fileName, fileContents);
    }
  }

  /**
   * @description Load the font awesome icon file content
   */
  _loadFileContent(){
    if ( !fs.existsSync(this.fontAwesomeFile) ) {
      console.error(`Font awesome icon file not found: ${this.fontAwesomeFile}`);
      return;
    }
    this._fileContent = fs.readFileSync(this.fontAwesomeFile, 'utf8');
  }

  /**
   * @description Write file to font awesome node module directory
   * @param {String} fileName - Name of the new file
   * @param {String} fileContent - File content
   */
  _writeNewFileContent(fileName, fileContent){
    fileName = `${fileName}.js`;
    const newFile = path.join(this.fontAwesomeDir, fileName);
    fs.writeFileSync(newFile, fileContent);
    console.log(`New icon file created: ${newFile}`);
  }

  /**
   * @description Replace file content with subset of icons
   * @param {Array} icons - Array of icon names to include in the new file
   * @returns {String} - New file contents with subsetted icons
   */
  _subSetIcons(icons){
    let fileContent = this._fileContent;

    // file has several objects with keys as icon names i.e. var icons = {...}
    // need to extract the objects and then filter out the icons that are not in the subset
    // and then return the new object
    const iconObjects = fileContent.match(/var icons = {[^}]+}/g);
    if ( !iconObjects || !iconObjects.length ) {
      console.error('No icon objects found in file');
      return;
    }

    // replace all iconObjects with the new subset
    iconObjects.forEach(iconObject => {

      // loop through each line and check if the key is in the subset, if not remove the line
      const iconObjectLines = iconObject.split('\n');
      const newIconObjectLines = iconObjectLines.filter(line => {
        const key = line.match(/"[^"]+":/);
        if ( !key ) return true;
        return icons.includes(key[0].replace(/"/g, '').replace(':', ''));
      });

      const newIconObject = newIconObjectLines.join('\n');
      fileContent = fileContent.replace(iconObject, newIconObject);
    });


    return fileContent;
  }
}

new subsetIcons().run();
