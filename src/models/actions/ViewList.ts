// Third-party dependencies
import chalk from 'chalk';
import clear from 'clear';

// Local dependencies
import Action from './Action';
import ReadingList from '../ReadingList';


export default class AddBookAction extends Action {
  constructor(){
    super();
  }

  static async start(user, readingListPage: number): Promise<AddBookAction>{
    const addBookAction = new AddBookAction();
    clear();

    const tenBooksInList = await addBookAction.getList(user, readingListPage);
    addBookAction.logBooks(tenBooksInList);

    return { addBookAction };
  }

  private async getList(user, readingListPage: number){
    if (!readingListPage || readingListPage < 1){
      readingListPage = 1;
    }

    return await ReadingList.getList(user, readingListPage);
  }

  private logBooks(tenBooksInList): void{
    if(tenBooksInList.length){
      console.log(chalk.bold("Your Reading List:"));
      tenBooksInList.forEach(this.logOneBook);
    }else{
      console.log("There are no books in your reading list");
    }
  }

}
