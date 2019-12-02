import ReadingListManager from './models/ReadingListManager';

import chalk from 'chalk';
import emoji from 'node-emoji';
const error = (message: string) => console.error(`${emoji.get('warning')}  ${chalk.keyword('red')(message)}`);


const start = async () => {
  try {
    const readingListManager = new ReadingListManager();
    readingListManager.start();
  } catch (err) {
    error("Sorry, there was an unexpected error with the program.");
    error("If the issue persists, please contact the developer.\n");
    error(err);
    process.exit();
  }
}

start();

export default start;
