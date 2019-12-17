import { assert } from 'chai';
import sinon from 'sinon';
import User from  '../../src/models/User';
import db from '../../src/sequelize/models';
import chalk from 'chalk';
import actions from '../../src/models/actions'
import Book from '../../src/models/Book';
import ReadingList from '../../src/models/ReadingList';


let defaultUser;

const title: string = 'Born a Crime';
const authors: string[] = ['Trevor Noah'];
const publisher: string = 'Spiegel & Grau';
const isbn_10: string = '0399588183';
const isbn_13: string = '9780399588181';

const bookInfo1 = {
  title: "Make Way for Ducklings",
  authors: ["Robert McCloskey"],
  publisher: "Puffin Books",
  isbn_10: "0140501711",
  isbn_13: "9780140501711",
};

const bookInfo2 = {
  title: "Where the Crawdads Sing",
  authors: ["Delia Owens"],
  publisher: "Penguin",
  isbn_10: "0735219117",
  isbn_13: "9780735219113",
};

describe('RemoveBook action', (): void => {
  before(async () => {
    defaultUser = await User.loginAsDefault();
  });

  beforeEach(async (): Promise<void> => {
    // remove all books from reading list
    await db.UserBook.destroy({ where: {} });
    await db.Book.destroy({ where: {} });
  });

  it('should delete selected books', async (): Promise<void> => {
    // add book
    const bookAdded = await ReadingList.addBook({ title, authors, publisher, isbn_10, isbn_13 }, defaultUser);

    // fake user input
    const promptBooksToRemove = sinon.fake.resolves({ bookIndices: [0] });
    sinon.replace(actions.RemoveBook.prototype, 'promptBooksToRemove', promptBooksToRemove);

    // remove book
    await actions.RemoveBook.start([bookAdded], defaultUser);

    // get books and check the book is removed
    const booksInDB = await ReadingList.getList(defaultUser, 1);
    assert.lengthOf(booksInDB, 0);
  });

    it('should console log titles of deleted books', async (): Promise<void> => {
      // add books
      const bookAdded1 = await ReadingList.addBook({ title, authors, publisher, isbn_10, isbn_13 }, defaultUser);
      const bookAdded2 = await ReadingList.addBook(bookInfo1, defaultUser);

      // fake user input
      const promptBooksToRemove = sinon.fake.resolves({ bookIndices: [0, 1] });
      sinon.replace(actions.RemoveBook.prototype, 'promptBooksToRemove', promptBooksToRemove);

      // remove book
      await actions.RemoveBook.start([bookAdded1, bookAdded2], defaultUser);

      // get arguments logged
      const args = fdCLI.fakes.consoleLogFake.args;

      // assertions
      const secondToLastArg = args[args.length - 2][0];
      const lastArg = args[args.length - 1][0];
      assert.strictEqual(secondToLastArg, chalk.bold("Books removed:"))
      assert.include(lastArg, chalk.redBright(bookAdded1.title))
      assert.include(lastArg, chalk.redBright(bookAdded2.title))
    });

    it('should inform user that no books were removed if no books were removed', async (): Promise<void> => {
      // add books
      const bookAdded1 = await ReadingList.addBook({ title, authors, publisher, isbn_10, isbn_13 }, defaultUser);
      const bookAdded2 = await ReadingList.addBook(bookInfo1, defaultUser);

      // fake user input
      const promptBooksToRemove = sinon.fake.resolves({ bookIndices: [] });
      sinon.replace(actions.RemoveBook.prototype, 'promptBooksToRemove', promptBooksToRemove);

      // remove book
      await actions.RemoveBook.start([bookAdded1, bookAdded2], defaultUser);

      // get last argument logged
      const arg = fdCLI.fakes.consoleLogFake.lastCall.lastArg;

      // assertions
      assert.strictEqual(arg, "No books removed");
    });
});