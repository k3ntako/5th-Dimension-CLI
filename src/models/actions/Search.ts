// Third-party dependencies
import chalk from 'chalk';
import clear from 'clear';
import { prompt } from 'inquirer';

// Local dependencies
import Action from './Action';
import Book from '../Book';
import BookSearch from '../BookSearch';
import { error, warn } from '../../utilities/logging';
import Loading from '../Loading';


export default class SearchAction extends Action {
  loading: Loading;
  constructor(){
    super();

    this.loading = new Loading();
  }

  static async start(): Promise<SearchAction>{
    const searchAction = new SearchAction();

    const { googleResults, searchStr } = searchAction.promptSearch();
    searchAction.logBooks(googleResults, searchStr);

    return searchAction;
  }

  private async promptSearch() {
    const { searchStr } = await prompt({
      message: "Please enter your search term...",
      name: "searchStr",
      type: "input",
    });

    if(!searchStr || !searchStr.trim()){
      clear();
      warn("No search term entered");
      return await this.promptSearch();
    }

    const googleResults: Book[] = await this.fetchBooks(searchStr);

    return { googleResults, searchStr };
  }

  private fetchBooks = async (searchStr): Promise<Book[]> => {
    try{
      this.loading.start();
      const googleResults = await BookSearch.search(searchStr);
      this.loading.stop();
      return googleResults;
    } catch(err) {
      this.loading.stop();
      error(err);
    }
  }

  private logBooks(googleResults: Book[], searchStr: string): void{
    if(!googleResults.length){
      return warn(`No books found for: "${searchStr}"`);
    }

    console.log(`${chalk.bold("Search results for:")} "${searchStr}"\n`);
    googleResults.forEach(this.logOneBook);
  }

}
