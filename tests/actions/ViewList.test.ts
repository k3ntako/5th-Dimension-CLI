import { assert } from 'chai';
import sinon from 'sinon';
import User from '../../src/models/User';
import db from '../../src/sequelize/models';
import actions from '../../src/models/actions'
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

describe('ViewList', (): void => {
  before(async () => {
    defaultUser = await User.loginAsDefault();

    // Delete all the books added above
    await db.UserBook.destroy({ where: {} });
    await db.Book.destroy({ where: {} });
  });

  it('should not console log books if user has no books in their reading list', async (): Promise<void> => {
    // fake ViewList#logOneBook
    const fakeLogOneBook: sinon.SinonSpy<any> = sinon.fake();
    sinon.replace(actions.ViewList.prototype, 'logOneBook', fakeLogOneBook);

    // call ViewList
    await actions.ViewList.start(defaultUser, 1);

    // assertions
    assert.strictEqual(fakeLogOneBook.callCount, 0, "logOnneBook should not be called");
    assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 1, "Console log should be called once");

    const arg: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
    assert.strictEqual(arg, "There are no books in your reading list");
  });

  it('should console log reading list', async (): Promise<void> => {
    await ReadingList.addBook(bookInfo1, defaultUser);

    // fake ViewList#logOneBook
    const fakeLogOneBook: sinon.SinonSpy<any> = sinon.fake();
    sinon.replace(actions.ViewList.prototype, 'logOneBook', fakeLogOneBook);

    // call ViewList
    await actions.ViewList.start(defaultUser, 1);

    // remove authors, because it's harder to test
    const bookInfo1WithoutAuthor = bookInfo1;
    delete bookInfo1.authors;

    // assertions
    assert.strictEqual(fakeLogOneBook.callCount, 1, "logBook should be called once");
    assert.deepInclude(fakeLogOneBook.lastArg[0], bookInfo1WithoutAuthor);
  });
});
