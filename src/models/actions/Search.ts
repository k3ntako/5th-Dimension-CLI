// Third-party dependencies
import clear from 'clear';
import { prompt } from 'inquirer';

// Local dependencies
import Book from '../Book';
import BookSearch from '../BookSearch';
import { error, warn } from '../../utilities/errorLogging';
import Loading from '../Loading';


export default class SearchAction {
  loading: Loading;
  constructor(){
    this.loading = new Loading();
  }

  static async start(): Promise<{ googleResults: Book[]; searchStr: string}>{
    const searchAction: SearchAction = new SearchAction();

    const searchStr: string = await searchAction.promptSearchStr();
    const googleResults: Book[] = await searchAction.fetchBooks(searchStr);

    return {googleResults, searchStr};
  }

  private async promptSearchStr(): Promise<string> {
    const { searchStr } = await prompt({
      message: "Please enter your search term...",
      name: "searchStr",
      type: "input",
    });

    if(!searchStr || !searchStr.trim()){
      throw new Error("No search term entered")
    }

    return searchStr;
  }

  private fetchBooks = async (searchStr: string): Promise<Book[]> => {
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
}
