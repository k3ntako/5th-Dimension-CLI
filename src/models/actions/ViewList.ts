// Third-party dependencies
import chalk from 'chalk';
import clear from 'clear';

// Local dependencies
import Action from './Action';
import ReadingList from '../ReadingList';


export default class ViewListAction extends Action {
  constructor(){
    super();
  }

  static async start(user, readingListPage: number){
    const viewListAction = new ViewListAction();
    clear();

    const tenBooksInList = await ReadingList.getList(user, readingListPage);
    viewListAction.logBooks(tenBooksInList);

    return { viewListAction };
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
