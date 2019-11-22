import ReadingListManager from './models/ReadingListManager';


export default class FifthDimensionCLI {
  constructor(){}

  static start(){
    const readingListManager = new ReadingListManager();
    readingListManager.start();
  }
}

FifthDimensionCLI.start();
