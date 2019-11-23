import { assert } from 'chai';
import sinon from 'sinon';
import ReadingListManager from '../src/models/ReadingListManager';
import ReadingList from '../src/models/ReadingList';
import Book from '../src/models/Book';
import User from  '../src/models/User';

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

describe('ReadingListManager', (): void => {
  before(async () => {
    defaultUser = await User.loginAsDefault();
  });

  describe('new ReadingListManager()', (): void => {
    it('should throw an error if no user is passed in', (): void => {
      assert.throws(() => new ReadingListManager(), "No user passed in");
    });
  })

  describe('#start()', (): void => {
    it('should console log welcome message', (): void => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.start();
      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 2);
    });

    it('should call on readingListManager#question', (): void => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);

      const questionFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager, 'question', questionFake);

      readingListManager.start();
      assert.strictEqual(questionFake.callCount, 1);
    });
  });

  describe('#question()', async (): Promise<void> => {
    it('should call ReadingListManager.prompt with appropriate arguments', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "exit" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      await readingListManager.question();

      const args = fakePrompt.lastArg;

      assert.strictEqual(args.message, 'What would you like to do?');
      assert.strictEqual(args.name, 'action');
      assert.strictEqual(args.type, 'list');
      assert.sameDeepMembers(args.choices, [{
        name: 'Search Google Books',
        value: 'search',
      }, {
        name: 'Look at your reading list',
        value: 'reading_list',
      },
      ]);
    });

    it('should call BookSearch#promptSearch if user selects search', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "search" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      const fakePromptSearch: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "search" });
      sinon.replace(readingListManager, 'promptSearch', fakePromptSearch);
      await readingListManager.question();
      assert.strictEqual(fakePromptSearch.callCount, 1);
    });

    it('should ask if user would like to add books to reading list if there are search results', async (): Promise<void> => {
      const book: Book = new Book({ title, authors, publisher, isbn_10, isbn_13 });

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "exit" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.bookSearch.results = [book];
      await readingListManager.question();

      const args = fakePrompt.lastArg;


      assert.includeDeepMembers(args.choices, [{
        name: 'Add book(s) above to your reading list',
        value: 'add_book',
      }]);

    });
  });

  describe('#promptSearch()', (): void => {
    it('should fetch a books from Google Books based on BookSearch#searchStr and console log the results', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ search: title });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      await readingListManager.promptSearch();

      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 21);


      const arg0: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.include(arg0, `Search results: "${title}"`);
      const arg1: string = fdCLI.fakes.consoleLogFake.getCall(1).lastArg;
      assert.include(arg1, "Born a Crime");
      const arg2: string = fdCLI.fakes.consoleLogFake.getCall(2).lastArg;
      assert.include(arg2, "Author(s): ");
      const arg3: string = fdCLI.fakes.consoleLogFake.getCall(3).lastArg;
      assert.include(arg3, "Publisher: ");
    });
  });

  describe('#promptSearch()', (): void => {
    it('should call ReadingList.addBook with books selected', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ bookIndices: [0,2] });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const fakeAddBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(ReadingList, 'addBook', fakeAddBook);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.bookSearch.results = [
        new Book({ title, authors, publisher, isbn_10, isbn_13 }),
        new Book(bookInfo1),
        new Book(bookInfo2),
      ];
      await readingListManager.promptAddBook();

      const callCount = fakeAddBook.callCount

      const args0 = fakeAddBook.getCall(0).args[0];
      const args1 = fakeAddBook.getCall(1).args[0];

      assert.include({
        title: args0.title,
        authors: args0.authors,
        publisher: args0.publisher,
        isbn_10: args0.isbn_10,
        isbn_13: args0.isbn_13
      }, {
        title, authors, publisher, isbn_10, isbn_13
      });

      assert.include({
        title: args1.title,
        authors: args1.authors,
        publisher: args1.publisher,
        isbn_10: args1.isbn_10,
        isbn_13: args1.isbn_13
      }, {
        title: bookInfo2.title,
        authors: bookInfo2.authors,
        publisher: bookInfo2.publisher,
        isbn_10: bookInfo2.isbn_10,
        isbn_13: bookInfo2.isbn_13
      });
    });
  });

});
