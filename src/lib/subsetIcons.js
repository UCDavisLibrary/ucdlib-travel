import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Subset font awesome icons
 * @description This script will take the font awesome all.js file and create a new file with a subset of icons
 * based on the icons object in the class. The new files will be saved in the same directory as the all.js file.
 * The key of the icons object will be the new file name and the value will be an array of icon names to include in the new file.
 */
class subsetIcons {

  constructor() {

    this.icons = {
      'ucdlib-travel': [
        'arrow-down',
        'arrow-left',
        'arrow-up',
        'ban',
        'building',
        'calendar',
        'chart-bar',
        'circle-chevron-right',
        'circle-exclamation',
        'circle-minus',
        'circle-notch',
        'circle-plus',
        'comment',
        'credit-card',
        'diagram-projet',
        'edit',
        'exclamation-circle',
        'file-import',
        'gear',
        'list',
        'magnifying-glass',
        'money-bill',
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


  init(){
    this._loadFileContent();
    if ( !this._fileContent ) return;
    for (const [fileName, icons] of Object.entries(this.icons)) {
      const fileContents = this._subSetIcons(icons);
      this._writeNewFileContent(fileName, fileContents);
    }
  }

  _loadFileContent(){
    // check if exists
    if ( !fs.existsSync(this.fontAwesomeFile) ) {
      console.error(`Font awesome icon file not found: ${this.fontAwesomeFile}`);
      return;
    }
    this._fileContent = fs.readFileSync(this.fontAwesomeFile, 'utf8');
  }

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

new subsetIcons().init();
