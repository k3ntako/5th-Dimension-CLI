import { assert } from 'chai';
import sinon from 'sinon';
import User from  '../../src/models/User';
import db from '../../src/sequelize/models';
import chalk from 'chalk';
import actions from '../../src/models/actions'
import ReadingList from '../../src/models/ReadingList';
import {
  bornACrimeInfo,
  makeWayForDucklingsInfo,
} from '../_testHelpers/BookInstances';
import ReadingListManager from '../../src/models/ReadingListManager';


let defaultUser;

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
    const bookAdded = await ReadingList.addBook(bornACrimeInfo, defaultUser);

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
      const readingListManager = new ReadingListManager(defaultUser);

      // add books
      const bornACrimeBook = await ReadingList.addBook(bornACrimeInfo, defaultUser);
      const makeWayForDucklingsBook = await ReadingList.addBook(makeWayForDucklingsInfo, defaultUser);

      // replace readingListManager.prompt
      const fakePrompt = sinon.fake.resolves({ action: "removeBook" });
      sinon.replace(readingListManager, 'prompt', fakePrompt);

      // replace setTimeout so it doesn't as another question
      const fakeSetTimeout = sinon.fake();
      sinon.replace(global, 'setTimeout', fakeSetTimeout);

      // fake user input
      const promptBooksToRemove = sinon.fake.resolves({ bookIndices: [0, 1] });
      sinon.replace(actions.RemoveBook.prototype, 'promptBooksToRemove', promptBooksToRemove);

      // remove books
      await readingListManager.question();

      // get arguments logged
      const args = fdCLI.fakes.consoleLogFake.args;

      // assertions
      const secondToLastArg = args[args.length - 2][0];
      const lastArg = args[args.length - 1][0];
      assert.strictEqual(secondToLastArg, chalk.bold("Book(s) removed:"))
      assert.include(lastArg, chalk.redBright(bornACrimeBook.title))
      assert.include(lastArg, chalk.redBright(makeWayForDucklingsBook.title))
    });

    it('should inform user that no books were removed if no books were removed', async (): Promise<void> => {
      const readingListManager = new ReadingListManager(defaultUser);

      // add books
      await ReadingList.addBook(bornACrimeInfo, defaultUser);
      await ReadingList.addBook(makeWayForDucklingsInfo, defaultUser);

      // replace readingListManager.prompt
      const fakePrompt = sinon.fake.resolves({ action: "removeBook" });
      sinon.replace(readingListManager, 'prompt', fakePrompt);

      // replace setTimeout so it doesn't as another question
      const fakeSetTimeout = sinon.fake();
      sinon.replace(global, 'setTimeout', fakeSetTimeout);

      // fake user input
      const promptBooksToRemove = sinon.fake.resolves({ bookIndices: [] });
      sinon.replace(actions.RemoveBook.prototype, 'promptBooksToRemove', promptBooksToRemove);

      // remove books
      await readingListManager.question();

      // get last argument logged
      const arg = fdCLI.fakes.consoleLogFake.lastCall.lastArg;

      // assertions
      assert.strictEqual(arg, "No books removed");
    });
});