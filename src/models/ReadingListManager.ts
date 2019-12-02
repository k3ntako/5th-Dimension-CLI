import BookSearch from './BookSearch';
import ReadingList from './ReadingList';
import inquirer from 'inquirer';
import Book from './Book';
import Loading from './Loading';
import clear from 'clear';
import emoji from 'node-emoji';
import chalk from 'chalk';
import { warn, error } from '../utilities/logging';

const prompt = inquirer.createPromptModule();
const NUMBERS = [
  emoji.get('zero'), // never used, but index matches the number
  emoji.get('one'),
  emoji.get('two'),
  emoji.get('three'),
  emoji.get('four'),
  emoji.get('five'),
  emoji.get('six'),
  emoji.get('seven'),
  emoji.get('eight'),
  emoji.get('nine'),
  emoji.get('one') + " " + emoji.get('zero'),
];

const APP_NAME = chalk.cyanBright.bold("5th Dimension CLI");


const defaultChoices: inquirer.ChoiceCollection = [{
  name: emoji.get('mag') + " Search for books!",
  value: "search",
}];


export default class ReadingListManager {
  googleResults: Book[];
  loading: Loading;
  readingListPage: number;
  readingList: ReadingList;
  constructor() {
    this.loading = new Loading();
    this.googleResults = [];
    this.readingListPage = 0; // 0 means reading list not shown
    this.readingList = ReadingList.start();
  }

  static async prompt(question: inquirer.QuestionCollection): Promise<inquirer.Answers> {
    return await prompt(question);
  }

  start(): void {
    clear();
    console.log(`Welcome to ${APP_NAME}!`);
    console.log("It's place to discover new books and save them for later!");
    this.question();
  }

  static exit(): void{
    console.log(`Thank you for using ${APP_NAME}!`)
    console.log("Hope to see you soon!");

    process.exit();
  }

  question = async (): Promise<void> => {
    const listCount = this.readingList.getCount();
    console.log("");

    let promptChoices: inquirer.ChoiceCollection = defaultChoices.concat();

    // Add choices given on the prompt
    // if user has books in reading list, add view_list and remove_book as options
    if (listCount > 0) {
      const bookPlurality = listCount === 1 ? "" : "s";

      promptChoices.push({
        name: emoji.get('books') + ` View your reading list (${listCount} book${bookPlurality})`,
        value: "view_list",
      }, {
        name: emoji.get('no_entry_sign') + ` Remove book(s) from your reading list`,
        value: "remove_book",
      });
    }

    // if there are results from a Google Books search, add add_book as an option
    if (this.googleResults.length){
      promptChoices.splice(2, 0, {
        name: emoji.get('star') + " Add book(s) above to your reading list",
        value: "add_book",
      })
    }

    // add next page and previous page as options if appropriate
    const hasNextPage = this.readingListPage && listCount > this.readingListPage * 10;
    const hasPreviousPage = this.readingListPage && this.readingListPage > 1;
    if (hasNextPage || hasPreviousPage) {
      promptChoices.push(new inquirer.Separator());
    }
    if (hasNextPage) {
      promptChoices.push({
        name: emoji.get('arrow_forward') + "  Next page",
        value: "next",
      });
    }
    if (hasPreviousPage) {
      promptChoices.push({
        name: emoji.get('arrow_backward') + "  Previous page",
        value: "previous",
      });
    }

    // add exit as an option
    promptChoices.push(
      new inquirer.Separator(),
      {
        name: emoji.get('closed_lock_with_key') + "  Exit",
        value: "exit",
      },
      new inquirer.Separator(),
    );

    // Prompt options
    const promptOptions: inquirer.ListQuestion = {
      message: "What would you like to do?",
      name: "action",
      choices: promptChoices,
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

  static logBook(book, idx?: number): void{
    const emojiNum = Number.isInteger(idx) ? `${NUMBERS[idx + 1]}  ` : "";
    const authors = book.authors && book.authors.length && book.authors.join(", ");

    console.log(emojiNum + chalk.bold(book.title));
    console.log("Author(s): " + (authors || "N/A"));
    console.log("Publisher: " + (book.publisher || "N/A") + "\n");
  }

  async promptSearch(): Promise<void> {
    this.readingListPage = 0;

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

  async promptAddBook(): Promise<void>{
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

    // filter out the books user selected
    const books = this.googleResults.filter((_, idx) => bookIndices.includes(idx));

    const titles: string[] = [];
    // add the  books to this.readingList.list
    books.forEach(book => {
      const added = this.readingList.addBook(book);
      added && titles.push(chalk.greenBright(book.title));
    });

    // save this.readingList.list to JSON file
    this.readingList.saveToFile();

    if (!titles.length) {
      return console.log('No new books added');
    }

    console.log(chalk.bold("Book(s) added:"));
    console.log(titles.join('\n'));
  }

  async promptRemoveBook(): Promise<void> {
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
    const promises = booksToRemove.map(book => this.readingList.removeBook(book.id));
    await Promise.all(promises);

    console.log(chalk.bold("Books removed:"))
    console.log(titles);
  }

  async viewList(): Promise<void>{
    clear();

    if (this.readingListPage < 1){
      this.readingListPage = 1;
    }

    const books = await this.readingList.getList(this.readingListPage);
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