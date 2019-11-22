import ReadingListManager from './models/ReadingListManager';
import User from './models/User';


export default class FifthDimensionCLI {
  constructor(){}

  static async start(){
    try{
      const user = await User.loginAsDefault();
      const readingListManager = new ReadingListManager(user);
      readingListManager.start();
    }catch(err){
      // TODO: Make this red
      console.error("Sorry there was an unexpected error with the program.");
      console.error("If the issue persists, please contact the developer.\n");
      console.error(err);
      process.exit();
    }
  }
}

FifthDimensionCLI.start();
