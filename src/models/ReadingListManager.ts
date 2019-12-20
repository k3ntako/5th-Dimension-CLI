/* eslint-disable no-case-declarations */
import ReadingList from './ReadingList';
import inquirer, {prompt} from 'inquirer';
import Book from './Book';
import { User as IUser } from '../sequelize/models/user';
import promptChoices from '../utilities/promptChoices';
import actions from './actions';
import loggers from './loggers';
import messages from '../utilities/messages';
import { warn } from '../utilities/errorLogging';


const defaultChoices: inquirer.ChoiceCollection = [ promptChoices.search() ];


export default class ReadingListManager {
  googleResults: Book[];
  user: IUser;
  readingListPage: number;
  actions: {};
  constructor(user) {
    if(!user || !user.id){
      throw new Error("No user passed in");
    }

    this.actions = {};
    for(const action in actions){
      this.actions[action] = new actions[action]()
    }

    this.user = user;
    this.googleResults = [];
    this.readingListPage = 0; // 0 means reading list not shown
  }

  start(): void {
    messages.startMessage();
    this.promptNextAction();
  }

  static exit(): void{
    messages.exitMessage();
    process.exit();
  }

  preparePromptChoices = (listCount: number): inquirer.ChoiceCollection => {
    const promptChoicesToDisplay: inquirer.ChoiceCollection = defaultChoices.concat();

    // Add choices given on the prompt
    // if user has books in reading list, add viewList and removeBook as options
    if (listCount) {
      const bookPlurality = listCount === 1 ? "" : "s";

      promptChoicesToDisplay.push(promptChoices.viewList(listCount, bookPlurality));
      promptChoicesToDisplay.push(promptChoices.removeBook());
    }

    // if there are results from a Google Books search, add addBook as an option
    if (this.googleResults.length){
      promptChoicesToDisplay.splice(2, 0, promptChoices.addBook())
    }

    // add next page and previous page as options if appropriate
    const hasNextPage = this.readingListPage && listCount > this.readingListPage * 10;
    const hasPreviousPage = this.readingListPage && this.readingListPage > 1;
    if (hasNextPage || hasPreviousPage) {
      promptChoicesToDisplay.push(new inquirer.Separator());
    }
    if (hasNextPage) {
      promptChoicesToDisplay.push(promptChoices.next());
    }
    if (hasPreviousPage) {
      promptChoicesToDisplay.push(promptChoices.previous());
    }

    // add exit as an option
    promptChoicesToDisplay.push(
      new inquirer.Separator(),
      promptChoices.exit(),
      new inquirer.Separator(),
    );

    return promptChoicesToDisplay;
  }

  async prompt(promptOptions): Promise<inquirer.Answers>{
    return await prompt(promptOptions)
  }

  promptNextAction = async (): Promise<void> => {
    messages.emptyLine(); // for spacing

    const listCount = await ReadingList.getCount(this.user);
    const promptChoicesToDisplay = this.preparePromptChoices(listCount);

    // Prompt options
    const promptOptions: inquirer.ListQuestion = {
      message: "What would you like to do?",
      name: "action",
      choices: promptChoicesToDisplay,
      type: "list",
    };

    // prompt
    const { action } = await this.prompt(promptOptions);
    await this.performAction(action);

    setTimeout(this.promptNextAction, 300); // Delay before prompting them again
  }

  async search(): Promise<void>{
    const { googleResults, searchStr } = await actions.Search.start();
    this.googleResults = googleResults;
    loggers.search(googleResults, searchStr);
  }

  async viewList(): Promise<void>{
    const tenBooksInList: Book[] = await ReadingList.getList(this.user, this.readingListPage);
    loggers.viewList(tenBooksInList);
  }

  async addBook(): Promise<void>{
    const booksAdded = await actions.AddBook.start(this.googleResults, this.user);
    loggers.addBook(booksAdded);
  }

  async removeBook(): Promise<void>{
    const tenBooksInList = await ReadingList.getList(this.user, this.readingListPage);
    const removedBooks = await actions.RemoveBook.start(tenBooksInList, this.user);
    loggers.removeBook(removedBooks);
  }

  async next(): Promise<void>{
    this.readingListPage++;
    const tenBooksInList = await ReadingList.getList(this.user, this.readingListPage);
    await loggers.viewList(tenBooksInList);
  }

  async previous(): Promise<void>{
    this.readingListPage--;
    const tenBooksInList = await ReadingList.getList(this.user, this.readingListPage);
    await loggers.viewList(tenBooksInList);
  }

  exit(): void{
    ReadingListManager.exit();
  }

  async performAction(action): Promise<void>{
    try {
      await this[action]();
    } catch(error) {
      warn(error.message);
    }
  }
}