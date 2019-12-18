import chalk from 'chalk';
import clear from 'clear';
import { warn } from './errorLogging';
import { NUMBERS } from './emoji';

const APP_NAME = chalk.cyanBright.bold("5th Dimension CLI");

export default {
  // General
  emptyLine: (): void => console.log(""),

  // Start and exit
  startMessage: (): void => {
    clear();
    console.log(`Welcome to ${APP_NAME}!`);
    console.log("It's place to discover new books and save them for later!");
  },
  exitMessage: (): void => {
    console.log(`Thank you for using ${APP_NAME}!`)
    console.log("Hope to see you soon!");
  },

  // Log one book
  logOneBook(book, idx?: number): void {
    const emojiNum = Number.isInteger(idx) ? `${NUMBERS[idx + 1]}  ` : "";
    const authors = book.authors && book.authors.join(", ");

    console.log(emojiNum + chalk.bold(book.title));
    console.log("Author(s): " + (authors || "N/A"));
    console.log("Publisher: " + (book.publisher || "N/A") + "\n");
  },

  // Adding books
  noBooksAdded: (): void => console.log('No books added'),
  booksAdded: (titles): void => {
    console.log(chalk.bold("Book(s) added:"));
    console.log(titles);
  },

  // Removing books
  noBookRemoved: (): void => console.log('No books removed'),
  booksRemoved: (titles): void => {
    console.log(chalk.bold("Book(s) removed:"))
    console.log(titles);
  },

  // Searching Google Books API
  searchResultsMessage: (searchStr): void => console.log(`${chalk.bold("Search results for:")} "${searchStr}"\n`),
  noSearchResults: (searchStr): void => warn(`No books found for: "${searchStr}"`),

  // View reading list
  readingListMessage: (): void => console.log(chalk.bold("Your Reading List:")),
  noReadingListBooks: (): void => console.log("There are no books in your reading list"),

}