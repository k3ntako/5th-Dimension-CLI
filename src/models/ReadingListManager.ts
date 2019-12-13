import BookSearch from './BookSearch';
import ReadingList from './ReadingList';
import inquirer from 'inquirer';
import Book from './Book';
import User from './User';
import Loading from './Loading';
import clear from 'clear';
import chalk from 'chalk';
import { User as IUser } from '../sequelize/models/user';
import { Book as IBook } from '../sequelize/models/book';
import promptChoices from '../utilities/promptChoices';
import { NUMBERS } from '../utilities/emoji';

import { warn, error } from '../utilities/logging';

const prompt = inquirer.createPromptModule();

const APP_NAME = chalk.cyanBright.bold("5th Dimension CLI");


const defaultChoices: inquirer.ChoiceCollection = [ promptChoices.search() ];


export default class ReadingListManager {
  googleResults: Book[];
  user: IUser;
  loading: Loading;
  readingListPage: number;
  constructor(user) {
    if(!user || !user.id){
      throw new Error("No user passed in");
    }

    this.user = user;
    this.loading = new Loading();
    this.googleResults = [];
    this.readingListPage = 0; // 0 means reading list not shown
  }

  static async prompt(question: inquirer.QuestionCollection): Promise<inquirer.Answers> {
    return await prompt(question);
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

  preparePromptChoices = async (): Promise<inquirer.ChoiceCollection> => {
    const listCount = await ReadingList.getCount(this.user);

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

    const promptChoicesToDisplay = await this.preparePromptChoices();

    // Prompt options
    const promptOptions: inquirer.ListQuestion = {
      message: "What would you like to do?",
      name: "action",
      choices: promptChoicesToDisplay,
      type: "list",
    };

    // prompt
    const { action } = await ReadingListManager.prompt(promptOptions);

    // calls appropriate actionn based on input
    switch (action) {
      case "search":
        clear();
        await this.promptSearch();
        break;

      case "view_list":
        clear();
        await this.viewList();
        break;

      case "add_book":
        await this.promptAddBook();
        break;

      case "remove_book":
        clear();
        await this.promptRemoveBook();
        break;

      case "next":
        clear();
        this.readingListPage++;
        await this.viewList();
        break;

      case "previous":
        clear();
        this.readingListPage--;
        await this.viewList();
        break;

      case "exit":
        clear();
        await ReadingListManager.exit();
        break;

      default:
        warn('Command was not found: ' + action);
        break;
    }

    setTimeout(this.question, 300); // Delay before prompting them again
  }

  static logBook(book, idx?: number){
    const emojiNum = Number.isInteger(idx) ? `${NUMBERS[idx + 1]}  ` : "";
    const authors = book.authors && book.authors.join(", ");

    console.log(emojiNum + chalk.bold(book.title));
    console.log("Author(s): " + (authors || "N/A"));
    console.log("Publisher: " + (book.publisher || "N/A") + "\n");
  }

  async promptSearch() {
    this.readingListPage = null ;

    const { search } = await ReadingListManager.prompt({
      message: "Please enter your search term...",
      name: "search",
      type: "input",
    });

    if(!search || !search.trim()){
      clear();
      warn("No search term entered");
      return await this.promptSearch();
    }

    try{
      this.loading.start();
      this.googleResults = await BookSearch.search(search);
      this.loading.stop();
    } catch(err) {
      this.loading.stop();
      error(err);
    }

    if (!this.googleResults.length){
      warn(`No books found for: "${search}"`);
    }else{
      console.log(`${chalk.bold("Search results for:")} "${search}"\n`);
      this.googleResults.forEach(ReadingListManager.logBook);
    }

    this.readingListPage = null;
  }

  async promptAddBook(){
    const promptChoices: inquirer.ChoiceCollection = this.googleResults.map((book, idx) => ({
      name: `${NUMBERS[idx + 1]}  ${book.title}`,
      value: idx,
    }));

    const { bookIndices } = await ReadingListManager.prompt({
      message: "Which book(s) would you like to add to your reading list?",
      name: "bookIndices",
      choices: promptChoices,
      type: "checkbox",
    });

    clear();

    if (!bookIndices.length) {
      return console.log('No books added');
    }

    const books = this.googleResults.filter((_, idx) => bookIndices.includes(idx));
    const titles = books.map(book => chalk.greenBright(book.title)).join('\n')

    const promises = books.map(book => ReadingList.addBook(book, this.user));
    await Promise.all(promises);

    console.log(chalk.bold("Book(s) added:"));
    console.log(titles);
  }

  async promptRemoveBook() {
    const books: IBook[] = await this.viewList();

    const promptChoices: inquirer.ChoiceCollection = books.map((book, idx) => ({
      name: `${NUMBERS[idx + 1]}  ${book.title}`,
      value: idx,
    }));

    const { bookIndices } = await ReadingListManager.prompt({
      message: "Which book(s) would you like to remove from your reading list?",
      name: "bookIndices",
      choices: promptChoices,
      type: "checkbox",
    });

    clear();

    if (!bookIndices.length) {
      return console.log('No books removed');
    }

    const booksToRemove = books.filter((_, idx) => bookIndices.includes(idx));

    const titles = booksToRemove.map(book => chalk.redBright(book.title)).join('\n')
    const promises = booksToRemove.map(book => ReadingList.removeBook(book.id, this.user.id));
    await Promise.all(promises);

    console.log(chalk.bold("Books removed:"))
    console.log(titles);
  }

  async viewList(){
    clear();

    if (this.readingListPage < 1){
      this.readingListPage = 1;
    }

    const books = await ReadingList.getList(this.user, this.readingListPage);
    if(books.length){
      console.log(chalk.bold("Your Reading List:"));
      books.forEach(ReadingListManager.logBook);

      return books;
    }else{
      console.log("There are no books in your reading list");
    }

    return [];
  }
}