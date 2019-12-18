import { assert } from 'chai';
import sinon from 'sinon';
import User from  '../../src/models/User';
import db from '../../src/sequelize/models';
import chalk from 'chalk';
import actions from '../../src/models/actions'
import {
  bornACrimeInfo,
  makeWayForDucklingsInfo,
  whereTheCrawdadsSingInfo
} from '../_testHelpers/BookInstances';

const googleResults = [
  bornACrimeInfo,
  makeWayForDucklingsInfo,
  whereTheCrawdadsSingInfo,
];

let defaultUser;

describe('AddBook action', (): void => {
  before(async () => {
    defaultUser = await User.loginAsDefault();
  });

  beforeEach(async () => {
    await db.UserBook.destroy({ where: {} });
    await db.Book.destroy({ where: {} });
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
      title: bornACrimeInfo.title,
      publisher: bornACrimeInfo.publisher,
      isbn_10: bornACrimeInfo.isbn_10,
      isbn_13: bornACrimeInfo.isbn_13
    });

    assert.include({
      title: secondBook.title,
      publisher: secondBook.publisher,
      isbn_10: secondBook.isbn_10,
      isbn_13: secondBook.isbn_13
    }, {
      title: whereTheCrawdadsSingInfo.title,
      publisher: whereTheCrawdadsSingInfo.publisher,
      isbn_10: whereTheCrawdadsSingInfo.isbn_10,
      isbn_13: whereTheCrawdadsSingInfo.isbn_13
    });
  });

  it('should console log titles of added books', async (): Promise<void> => {
    const promptBooksToAdd = sinon.fake.resolves({ bookIndices: [0, 2] });
    sinon.replace(actions.AddBook.prototype, 'promptBooksToAdd', promptBooksToAdd);

    await actions.AddBook.start(googleResults, defaultUser);

    const args = fdCLI.fakes.consoleLogFake.args;

    const secondToLastArg = args[args.length - 2][0];
    const lastArg = args[args.length - 1][0];
    assert.strictEqual(secondToLastArg, chalk.bold("Book(s) added:"))
    assert.include(lastArg, chalk.greenBright(bornACrimeInfo.title))
    assert.include(lastArg, chalk.greenBright(whereTheCrawdadsSingInfo.title))
  });

  it('should inform user that no books were added if no books were added', async (): Promise<void> => {
    const promptBooksToAdd = sinon.fake.resolves({ bookIndices: [] });
    sinon.replace(actions.AddBook.prototype, 'promptBooksToAdd', promptBooksToAdd);

    await actions.AddBook.start(googleResults, defaultUser);

    const arg = fdCLI.fakes.consoleLogFake.lastCall.lastArg;
    assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 1);
    assert.strictEqual(arg, "No books added");
  });
});
