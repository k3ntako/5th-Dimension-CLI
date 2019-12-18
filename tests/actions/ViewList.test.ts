import { assert } from 'chai';
import sinon from 'sinon';
import User from '../../src/models/User';
import db from '../../src/sequelize/models';
import actions from '../../src/models/actions'
import ReadingList from '../../src/models/ReadingList';
import {
  bornACrimeInfo,
} from '../_testHelpers/BookInstances';
import ReadingListManager from '../../src/models/ReadingListManager';
import messages from '../../src/utilities/messages';


let defaultUser;

describe('ViewList', (): void => {
  before(async () => {
    defaultUser = await User.loginAsDefault();

    // Delete all the books added above
    await db.UserBook.destroy({ where: {} });
    await db.Book.destroy({ where: {} });
  });

  it('should not console log books if user has no books in their reading list', async (): Promise<void> => {
    // initialize readingListManager instance
    const readingListManager = new ReadingListManager(defaultUser);

    // replace readingListManager.prompt
    const fakePrompt = sinon.fake.resolves({ action: "viewList" });
    sinon.replace(readingListManager, 'prompt', fakePrompt);

    // replace setTimeout so it doesn't as another question
    const fakeSetTimeout = sinon.fake();
    sinon.replace(global, 'setTimeout', fakeSetTimeout);

    // fake messages
    const fakeLogOneBook = sinon.fake();
    sinon.replace(messages, 'logOneBook', fakeLogOneBook);

    // call method
    await readingListManager.question();

    // assertions
    assert.strictEqual(fakeLogOneBook.callCount, 0, "logOneBook should not be called");
    assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 2, "Console log should be called once");

    const arg: string = fdCLI.fakes.consoleLogFake.getCall(1).lastArg;
    assert.strictEqual(arg, "There are no books in your reading list");
  });

  it('should console log reading list', async (): Promise<void> => {
    // add a book
    await ReadingList.addBook(bornACrimeInfo, defaultUser);

    // initialize readingListManager instance
    const readingListManager = new ReadingListManager(defaultUser);

    // replace readingListManager.prompt
    const fakePrompt = sinon.fake.resolves({ action: "viewList" });
    sinon.replace(readingListManager, 'prompt', fakePrompt);

    // replace setTimeout so it doesn't as another question
    const fakeSetTimeout = sinon.fake();
    sinon.replace(global, 'setTimeout', fakeSetTimeout);

    // fake messages
    const fakeLogOneBook = sinon.fake();
    sinon.replace(messages, 'logOneBook', fakeLogOneBook);

    // call method
    await readingListManager.question();

    // remove authors, because it's harder to test
    const bornACrimeWithoutAuthor = {
      title: bornACrimeInfo.title,
      publisher: bornACrimeInfo.publisher,
      isbn_10: bornACrimeInfo.isbn_10,
      isbn_13: bornACrimeInfo.isbn_13,
    };

    // assertions
    assert.strictEqual(fakeLogOneBook.callCount, 1, "logBook should be called once");
    assert.deepInclude(fakeLogOneBook.lastArg[0], bornACrimeWithoutAuthor);
  });
});
