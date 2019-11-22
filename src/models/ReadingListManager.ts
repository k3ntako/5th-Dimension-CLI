import { IBook } from '../utilities/interfaces';
import BookSearch from './BookSearch';
import ReadingList from './ReadingList';
import inquirer from 'inquirer';
const prompt = inquirer.createPromptModule();

const defaultChoices: inquirer.ChoiceCollection = [{
  name: "Search Google Books",
  value: "search",
}, {
  name: "Look at your reading list",
  value: "reading_list",
}];


export default class ReadingListManager {
  list: IBook[];
  bookSearch: BookSearch;
  constructor() {
    this.list = [];
    this.bookSearch = new BookSearch();
  }

  static async prompt(question: inquirer.QuestionCollection): Promise<inquirer.Answers> {
    return await prompt(question);
  }

  start() {
    console.log("Welcome to 5th Dimension CLI!");
    console.log("It's place to discover new books and save them for later!");
    this.question();
  }

  question = async (): Promise<void> => {
    const promptChoices: inquirer.ChoiceCollection = defaultChoices.concat();
    if (this.bookSearch.results.length){
      promptChoices.push({
        name: "Add book(s) above to your reading list",
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
    } else {
      return;
    }

    setTimeout(this.question, 300); // Delay before prompting them again
  }

  async promptSearch() {
    const { search } = await ReadingListManager.prompt({
      message: "Please enter your search term...",
      name: "search",
      type: "input",
    });

    this.bookSearch.search(search);
    await this.bookSearch.fetchBooks();

    console.log(`Search results: "${search}"\n`);
    console.log(this.bookSearch.results);

    this.bookSearch.results.forEach(book => {
      console.log(book.industryIdentifiers);

      const authors = book.authors && book.authors.join(", ");
      console.log(book.title);
      console.log("Author(s): " + (authors || "N/A"));
      console.log("Publisher: " + (book.publisher || "N/A"));
      console.log("\n");
    });
  }
}