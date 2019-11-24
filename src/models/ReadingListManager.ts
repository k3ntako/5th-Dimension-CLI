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


const defaultChoices: inquirer.ChoiceCollection = [{
  name: emoji.get('mag') + " Search for books!",
  value: "search",
}];


export default class ReadingListManager {
  googleResults: Book[];
  user: IUser;
  loading: Loading;
  listCount: number;
  constructor(user) {
    if(!user || !user.id){
      throw new Error("No user passed in");
    }

    this.user = user;
    this.loading = new Loading();
    this.listCount = 0;
    this.googleResults = [];
  }

  static async prompt(question: inquirer.QuestionCollection): Promise<inquirer.Answers> {
    return await prompt(question);
  }

  start() {
    clear();
    console.log("Welcome to 5th Dimension CLI!");
    console.log("It's place to discover new books and save them for later!");
    this.question();
  }

  question = async (): Promise<void> => {
    this.listCount = await ReadingList.getCount(this.user);

    const promptChoices: inquirer.ChoiceCollection = defaultChoices.concat();

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
      promptChoices.push({
        name: emoji.get('white_check_mark') + " Add book(s) above to your reading list",
        value: "add_book",
      });
    }

    const promptOptions: inquirer.ListQuestion = {
      message: "What would you like to do?",
      name: "action",
      choices: promptChoices,
      type: "list",
    };

    const { action } = await ReadingListManager.prompt(promptOptions);

    if(action === "search"){
      await this.promptSearch();
    } else if (action === "view_list") {
      await this.viewList();
    } else if (action === "add_book") {
      await this.promptAddBook();
    } else if (action === "remove_book") {
      await this.promptRemoveBook();
    } else {
      return;
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
    clear();
    const { search } = await ReadingListManager.prompt({
      message: "Please enter your search term...",
      name: "search",
      type: "input",
    });

    this.loading.start();
    this.googleResults = await BookSearch.search(search);
    this.loading.stop();

    console.log(`${chalk.bold("Search results for:")} "${search}"\n`);

    this.googleResults.forEach(ReadingListManager.logBook);
  }

  async promptAddBook(){
    clear();

    if (!this.googleResults.length) {
      throw new Error('No books');
    }

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

    const books = this.googleResults.filter((_, idx) => bookIndices.includes(idx));

    const promises = books.map(book => ReadingList.addBook(book, this.user));
    await Promise.all(promises);
  }

  async promptRemoveBook() {
    clear();

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

    const books = await ReadingList.getList(this.user);
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