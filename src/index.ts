import ReadingListManager from './models/ReadingListManager';
import User from './models/User';
import { error } from './utilities/logging';


const start = async () => {
  try {
    const user = await User.loginAsDefault();
    const readingListManager = new ReadingListManager(user);
    readingListManager.start();
  } catch (err) {
    error("Sorry, there was an unexpected error with the program.");
    error("If the issue persists, please contact the developer.\n");
    error(err);
    process.exit();
  }
}

export default start;
