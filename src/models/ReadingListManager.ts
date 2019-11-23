import BookSearch from './BookSearch';
import ReadingList from './ReadingList';
import inquirer from 'inquirer';
import User from './User';
import clear from 'clear';
import emoji from 'node-emoji';
import chalk from 'chalk';

const prompt = inquirer.createPromptModule();
const NUMBERS = ['one', 'two', 'three', 'four', 'five'];


const defaultChoices: inquirer.ChoiceCollection = [{
  name: emoji.get('mag') + " Search for books!",
  value: "search",
}, {
  name: emoji.get('books') + " View your reading list",
  value: "view_list",
}];


export default class ReadingListManager {
  bookSearch: BookSearch;
  user: User;
  constructor(user) {
    if(!user || !user.id){
      throw new Error("No user passed in");
    }

    this.bookSearch = new BookSearch();
    this.user = user;
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
    const promptChoices: inquirer.ChoiceCollection = defaultChoices.concat();
    if (this.bookSearch.results.length){
      promptChoices.push({
        name: emoji.get('heavy_plus_sign') + " Add book(s) above to your reading list",
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
    } else {
      return;
    }

    setTimeout(this.question, 300); // Delay before prompting them again
  }

  static logBook(book, idx?: number){
    const emojiNum = Number.isInteger(idx) ? `${emoji.get(NUMBERS[idx])}  ` : "";
    const authors = book.authors && book.authors.join(", ");

    console.log(emojiNum + chalk.bold(book.title));
    console.log("Author(s): " + (authors || "N/A"));
    console.log("Publisher: " + (book.publisher || "N/A") + "\n");
  }

  async promptSearch() {
    const { search } = await ReadingListManager.prompt({
      message: "Please enter your search term...",
      name: "search",
      type: "input",
    });

    this.bookSearch.search(search);
    await this.bookSearch.fetchBooks();

    console.log(`${chalk.bold("Search results for:")} "${search}"\n`);

    this.bookSearch.results.forEach(ReadingListManager.logBook);
  }

  async promptAddBook(){
    if (!this.bookSearch.results.length) {
      throw new Error('No books');
    }

    const promptChoices: inquirer.ChoiceCollection = this.bookSearch.results.map((book, idx) => ({
      name: `${emoji.get(NUMBERS[idx])}  ${book.title}`,
      value: idx,
    }));

    const { bookIndices } = await ReadingListManager.prompt({
      message: "Which book(s) would you like to add to your reading list?",
      name: "bookIndices",
      choices: promptChoices,
      type: "checkbox",
    });

    const books = this.bookSearch.results.filter((_, idx) => bookIndices.includes(idx));

    const promises = books.map(book => ReadingList.addBook(book, this.user));
    await Promise.all(promises);
  }

  async viewList(){
    const books = await ReadingList.getList(this.user);
    if(books.length){
      console.log(chalk.bold("Your Reading List:"));
      books.forEach(ReadingListManager.logBook);
    }else{
      console.log("There are no books in your reading list")
    }
  }
}