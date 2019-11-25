import BookSearch from './BookSearch';
import ReadingList from './ReadingList';
import inquirer from 'inquirer';
import Book from './Book';
import User from './User';
import Loading from './Loading';
import clear from 'clear';
import emoji from 'node-emoji';
import chalk from 'chalk';
import { User as IUser } from '../sequelize/models/user';
import { Book as IBook } from '../sequelize/models/book';

const warn = (message: string) => console.warn(`${emoji.get('warning')}  ${chalk.keyword('orange')(message)}`);

const prompt = inquirer.createPromptModule();
const NUMBERS = [
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
  user: IUser;
  loading: Loading;
  listCount: number;
  readingListPage: number;
  constructor(user) {
    if(!user || !user.id){
      throw new Error("No user passed in");
    }

    this.user = user;
    this.loading = new Loading();
    this.listCount = 0;
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

  question = async (): Promise<void> => {
    this.listCount = await ReadingList.getCount(this.user);
    console.log("");

    let promptChoices: inquirer.ChoiceCollection = defaultChoices.concat();

    if (this.listCount) {
      const bookPlurality = this.listCount === 1 ? "" : "s";

      promptChoices.push({
        name: emoji.get('books') + ` View your reading list (${this.listCount} book${bookPlurality})`,
        value: "view_list",
      }, {
        name: emoji.get('no_entry_sign') + ` Remove book(s) from your reading list`,
        value: "remove_book",
      });
    }

    if (this.googleResults.length){
      promptChoices.splice(2, 0, {
        name: emoji.get('star') + " Add book(s) above to your reading list",
        value: "add_book",
      })
    }

    const count = await ReadingList.getCount(this.user);
    const hasNextPage = this.readingListPage && count > this.readingListPage * 10;
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

    promptChoices.push(
      new inquirer.Separator(),
      {
        name: emoji.get('closed_lock_with_key') + "  Exit",
        value: "exit",
      },
      new inquirer.Separator(),
    );

    const promptOptions: inquirer.ListQuestion = {
      message: "What would you like to do?",
      name: "action",
      choices: promptChoices,
      type: "list",
    };

    const { action } = await ReadingListManager.prompt(promptOptions);

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
    const emojiNum = Number.isInteger(idx) ? `${NUMBERS[idx]}  ` : "";
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

    this.loading.start();
    this.googleResults = await BookSearch.search(search);
    this.loading.stop();

    console.log(`${chalk.bold("Search results for:")} "${search}"\n`);

    this.googleResults.forEach(ReadingListManager.logBook);

    this.readingListPage = null;
  }

  async promptAddBook(){
    const promptChoices: inquirer.ChoiceCollection = this.googleResults.map((book, idx) => ({
      name: `${NUMBERS[idx]}  ${book.title}`,
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
      name: `${NUMBERS[idx]}  ${book.title}`,
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

    this.readingListPage = this.readingListPage || 1;

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