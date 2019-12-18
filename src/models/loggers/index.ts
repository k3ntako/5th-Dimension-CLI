// Third-party dependencies
import clear from 'clear';
import chalk from 'chalk';

// Local dependencies
import Book from '../Book';
import messages from '../../utilities/messages';


export default {
  addBook(bookAdded: Book[]): void {
    clear();

    if (!bookAdded.length) {
      return messages.noBooksAdded();
    }

    const titles = bookAdded.map(book => chalk.greenBright(book.title)).join('\n');
    messages.booksAdded(titles)
  },

  removeBook(booksToRemove: Book[]): void {
    clear();

    const titles: string = booksToRemove.map(book => chalk.redBright(book.title)).join('\n');

    if (!booksToRemove.length) {
      return messages.noBookRemoved();
    }

    messages.booksRemoved(titles);
  },

  search({googleResults, searchStr}): void {
    if (!googleResults.length) {
      return messages.noSearchResults(searchStr);
    }

    messages.searchResultsMessage(searchStr);
    googleResults.forEach(messages.logOneBook);
  },

  viewList(tenBooksInList: Book[]): void {
    clear();

    if (tenBooksInList.length) {
      messages.readingListMessage();
      tenBooksInList.forEach(messages.logOneBook);
    } else {
      messages.noReadingListBooks();
    }
  }
}