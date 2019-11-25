import ReadingListManager from './models/ReadingListManager';
import User from './models/User';
import chalk from 'chalk';
import emoji from 'node-emoji';
const error = (message: string) => console.error(`${emoji.get('warning')}  ${chalk.keyword('red')(message)}`);


const start = async () => {
  try {
    const user = await User.loginAsDefault();
    const readingListManager = new ReadingListManager(user);
    readingListManager.start();
  } catch (err) {
    console.error("Sorry, there was an unexpected error with the program.");
    console.error("If the issue persists, please contact the developer.\n");
    console.error(err);
    process.exit();
  }
}

start();

export default start;
