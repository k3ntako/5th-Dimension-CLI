import { assert } from 'chai';
import sinon from 'sinon';
import User from  '../../src/models/User';
import db from '../../src/sequelize/models';
import chalk from 'chalk';
import actions from '../../src/models/actions'
import Book from '../../src/models/Book';


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

describe('AddBook action', (): void => {
  beforeEach(async () => {
    defaultUser = await User.loginAsDefault();


    await db.UserBook.destroy({ where: {} });
    await db.Book.destroy({ where: {} });
    // await ReadingList.addBook(bookInfo1, defaultUser);
  });

  it('should add selected books to db', async (): Promise<void> => {
    // find all books for the default user in DB
    const bookInDBBefore = await db.UserBook.findAll({
      where: {
        user_id: defaultUser.id,
      }
    });

    assert.lengthOf(bookInDBBefore, 0); // there should be no books


    const promptBooksToAdd = sinon.fake.resolves({ bookIndices: [0, 2] });
    sinon.replace(actions.AddBook.prototype, 'promptBooksToAdd', promptBooksToAdd);

    const googleResults = [
      new Book({ title, authors, publisher, isbn_10, isbn_13 }),
      new Book(bookInfo1),
      new Book(bookInfo2),
    ];

    await actions.AddBook.start(googleResults, defaultUser);

    assert.strictEqual(promptBooksToAdd.callCount, 1);

    const bookInDB = await db.UserBook.findAll({
      where: {
        user_id: defaultUser.id,
      },
      include: [{
        model: db.Book,
      }],
    });

    const bookPromises = bookInDB.map(book => book.toJSON());
    const bookInDBJson = await Promise.all(bookPromises);
    const firstBook = bookInDBJson[0].Book;
    const secondBook = bookInDBJson[1].Book;

    assert.lengthOf(bookInDBJson, 2);

    assert.include({
      title: firstBook.title,
      publisher: firstBook.publisher,
      isbn_10: firstBook.isbn_10,
      isbn_13: firstBook.isbn_13
    }, {
      title, publisher, isbn_10, isbn_13
    });

    assert.include({
      title: secondBook.title,
      publisher: secondBook.publisher,
      isbn_10: secondBook.isbn_10,
      isbn_13: secondBook.isbn_13
    }, {
      title: bookInfo2.title,
      publisher: bookInfo2.publisher,
      isbn_10: bookInfo2.isbn_10,
      isbn_13: bookInfo2.isbn_13
    });
  });

  it('should console log titles of added books', async (): Promise<void> => {
    const promptBooksToAdd = sinon.fake.resolves({ bookIndices: [0, 2] });
    sinon.replace(actions.AddBook.prototype, 'promptBooksToAdd', promptBooksToAdd);

    const googleResults = [
      new Book({ title, authors, publisher, isbn_10, isbn_13 }),
      new Book(bookInfo1),
      new Book(bookInfo2),
    ];

    await actions.AddBook.start(googleResults, defaultUser);

    const args = fdCLI.fakes.consoleLogFake.args;

    const secondToLastArg = args[args.length - 2][0];
    const lastArg = args[args.length - 1][0];
    assert.strictEqual(secondToLastArg, chalk.bold("Book(s) added:"))
    assert.include(lastArg, chalk.greenBright(title))
    assert.include(lastArg, chalk.greenBright(bookInfo2.title))
  });

  it('should inform user that no books were added if no books were added', async (): Promise<void> => {
    const promptBooksToAdd = sinon.fake.resolves({ bookIndices: [] });
    sinon.replace(actions.AddBook.prototype, 'promptBooksToAdd', promptBooksToAdd);

    const googleResults = [
      new Book({ title, authors, publisher, isbn_10, isbn_13 }),
      new Book(bookInfo1),
      new Book(bookInfo2),
    ];

    await actions.AddBook.start(googleResults, defaultUser);

    const arg = fdCLI.fakes.consoleLogFake.lastCall.lastArg;
    assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 1);
    assert.strictEqual(arg, "No books added");
  });
});
