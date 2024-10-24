import migration from './src/run.js';
import { Command } from 'commander';


const program = new Command();
program
  .name('Migration Tool')
  .description('Migrates old travel data to the new database.')
  .version('1.0.0')
  .option('-y, --year <type>', 'fiscal year')
  .option('-s, --single <type>', 'single request');


program.parse(process.argv);

const options = program.opts();

if (options.year || options.single) {
  migration.convertData(options.year, options.single);
} else{
  migration.convertData();
}
