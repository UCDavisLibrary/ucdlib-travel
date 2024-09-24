import util from 'util';

class log {
  static utilArgs = { showHidden: false, depth: null, colors: true };

  static log(...args) {
    console.log(...args.map(arg => util.inspect(arg, this.utilArgs)));
  }

  static error(...args) {
    console.error(...args.map(arg => util.inspect(arg, this.utilArgs)));
  }
}


export default log;
