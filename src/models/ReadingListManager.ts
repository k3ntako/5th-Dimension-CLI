import ReadingList from './ReadingList';
import inquirer,  {prompt} from 'inquirer';
import clear from 'clear';
import chalk from 'chalk';
import Book from './Book';
import { User as IUser } from '../sequelize/models/user';
import promptChoices from '../utilities/promptChoices';
import actions from './actions';

import { warn, error } from '../utilities/logging';

const APP_NAME = chalk.cyanBright.bold("5th Dimension CLI");


const defaultChoices: inquirer.ChoiceCollection = [ promptChoices.search() ];


export default class ReadingListManager {
  googleResults: Book[];
  user: IUser;
  readingListPage: number;
  constructor(user) {
    if(!user || !user.id){
      throw new Error("No user passed in");
    }

    this.user = user;
    this.googleResults = [];
    this.readingListPage = 0; // 0 means reading list not shown
  }

  start() {
    clear();
    console.log(`Welcome to ${APP_NAME}!`);
    console.log("It's place to discover new books and save them for later!");
    this.question();
  }

  static exit(){
    console.log(`Thank you for using ${APP_NAME}!`)
    console.log("Hope to see you soon!");

    process.exit();
  }

  preparePromptChoices = (listCount: number): inquirer.ChoiceCollection => {
    let promptChoicesToDisplay: inquirer.ChoiceCollection = defaultChoices.concat();

    // Add choices given on the prompt
    // if user has books in reading list, add view_list and remove_book as options
    if (listCount) {
      const bookPlurality = listCount === 1 ? "" : "s";

      promptChoicesToDisplay.push(promptChoices.view_list(listCount, bookPlurality));
      promptChoicesToDisplay.push(promptChoices.remove_book());
    }

    // if there are results from a Google Books search, add add_book as an option
    if (this.googleResults.length){
      promptChoicesToDisplay.splice(2, 0, promptChoices.add_book())
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

  question = async (): Promise<void> => {
    console.log(""); // for spacing

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
    const { action } = await prompt(promptOptions);
    await this.performAction(action);


    setTimeout(this.question, 300); // Delay before prompting them again
  }

  async performAction(action){
    // calls appropriate actionn based on input
    switch (action) {
      case "search":
        clear();
        const { googleResults } = await actions.Search.start();
        this.googleResults = googleResults;
        break;

      case "view_list":
        clear();
        await actions.ViewList.start(this.user, this.readingListPage);
        break;

      case "add_book":
        await actions.AddBook.start(this.googleResults, this.user);
        break;

      case "remove_book":
        clear();
        const tenBooksInList = await ReadingList.getList(this.user, this.readingListPage);
        await actions.RemoveBook.start(tenBooksInList, this.user);
        break;

      case "next":
        clear();
        this.readingListPage++;
        await actions.ViewList.start(this.user, this.readingListPage);
        break;

      case "previous":
        clear();
        this.readingListPage--;
        await actions.ViewList.start(this.user, this.readingListPage);
        break;

      case "exit":
        clear();
        await ReadingListManager.exit();
        break;

      default:
        warn('Command was not found: ' + action);
        break;
    }
  }
}