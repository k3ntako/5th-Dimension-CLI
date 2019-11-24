import { assert } from 'chai';
import sinon from 'sinon';
import ReadingListManager from '../src/models/ReadingListManager';
import ReadingList from '../src/models/ReadingList';
import Book from '../src/models/Book';
import User from  '../src/models/User';
import db from '../src/sequelize/models';
import emoji from 'node-emoji';
import chalk from 'chalk';
import inquirer from 'inquirer';


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
    before(async (): Promise<void> => {
      await db.UserBook.destroy({ where: {} });
      await ReadingList.addBook(bookInfo1, defaultUser);
    });

    it('should call ReadingListManager.prompt with appropriate arguments', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      await readingListManager.question();

      const args = fakePrompt.lastArg;

      assert.strictEqual(args.message, 'What would you like to do?');
      assert.strictEqual(args.name, 'action');
      assert.strictEqual(args.type, 'list');
      assert.sameDeepMembers(args.choices, [{
          name: emoji.get('mag') + " Search for books!",
          value: 'search',
        }, {
        name: emoji.get('books') + " View your reading list (1 book)",
        value: 'view_list',
        }, {
          name: emoji.get('no_entry_sign') + ` Remove book(s) from your reading list`,
          value: "remove_book",
        },
        new inquirer.Separator(),
        {
          name: emoji.get('closed_lock_with_key') + "  Exit",
          value: "exit",
        }
      ]);
    });

    it('should call ReadingListManager#promptSearch if user selects search', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "search" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      const fakePromptSearch: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager, 'promptSearch', fakePromptSearch);
      await readingListManager.question();
      assert.strictEqual(fakePromptSearch.callCount, 1);
    });

    it('should ask if user would like to add books to reading list if there are search results', async (): Promise<void> => {
      const book: Book = new Book({ title, authors, publisher, isbn_10, isbn_13 });

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.googleResults = [book];
      await readingListManager.question();

      const args = fakePrompt.lastArg;


      assert.includeDeepMembers(args.choices, [{
        name: emoji.get('star') + " Add book(s) above to your reading list",
        value: 'add_book',
      }]);

    });

    it('should call ReadingListManager#viewList if user selects to view list', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "view_list" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      const fakeViewList: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager, 'viewList', fakeViewList);
      await readingListManager.question();
      assert.strictEqual(fakeViewList.callCount, 1);
    });
  });

  describe('.logBook', (): void => {
    it('should console log information about the book', async (): Promise<void> => {
      ReadingListManager.logBook({
        title,
        authors,
        publisher: null,
      });

      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 3);

      const arg1: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg1, chalk.bold(title));
      const arg2: string = fdCLI.fakes.consoleLogFake.getCall(1).lastArg;
      assert.strictEqual(arg2, "Author(s): " + authors[0]);
      const arg3: string = fdCLI.fakes.consoleLogFake.getCall(2).lastArg;
      assert.strictEqual(arg3, "Publisher: N/A\n");
    });

    it('should console log the title with emoji if provided a number', async (): Promise<void> => {
      ReadingListManager.logBook({
        title,
        authors,
        publisher: null,
      }, 0);

      const arg: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg, `${emoji.get('one')}  ${chalk.bold(title)}`);
    });
  });

  describe('#promptSearch()', (): void => {
    it('should fetch a books from Google Books based on search query and console log the results', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ search: title });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const fakeLogBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(ReadingListManager, 'logBook', fakeLogBook);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      await readingListManager.promptSearch();

      const arg0: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg0, `${chalk.bold("Search results for:")} "${title}"\n`);
      assert.include(arg0, title);

      assert.strictEqual(fakeLogBook.callCount, 5);
    });

    it('should warn user if they enter a blank search', async (): Promise<void> => {
      const promptStub = sinon.stub();
      promptStub.onCall(0).resolves({ search: "  " }); // returns this on first call
      promptStub.resolves({ search: "Hello" }); // returns on every call after first
      sinon.replace(ReadingListManager, 'prompt', promptStub);

      const consoleWarnFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(console, 'warn', consoleWarnFake);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      await readingListManager.promptSearch();

      const arg = consoleWarnFake.lastCall.lastArg;
      assert.include(arg, 'No search term entered');
      assert.include(arg, emoji.get('warning'));
    });
  });

  describe('#promptSearch()', (): void => {
    it('should call ReadingList.addBook with books selected', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ bookIndices: [0,2] });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const fakeAddBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(ReadingList, 'addBook', fakeAddBook);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.googleResults = [
        new Book({ title, authors, publisher, isbn_10, isbn_13 }),
        new Book(bookInfo1),
        new Book(bookInfo2),
      ];
      await readingListManager.promptAddBook();

      assert.strictEqual(fakeAddBook.callCount, 2)

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

  describe('#viewList()', (): void => {
    before(async (): Promise<void> => {
      // Delete all the books added above
      await db.UserBook.destroy({ where: {} });
    });

    it('should not console log books if user has no books in their reading list', async (): Promise<void> => {
      const fakeLogBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(ReadingListManager, 'logBook', fakeLogBook);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      await readingListManager.viewList();

      assert.strictEqual(fakeLogBook.callCount, 0, "logBook should not be called");
      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 1, "Console log should be called once");

      const arg: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg, "There are no books in your reading list");
    });

    it('should console log reading list', async (): Promise<void> => {
      await ReadingList.addBook(bookInfo1, defaultUser);

      const fakeLogBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(ReadingListManager, 'logBook', fakeLogBook);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      await readingListManager.viewList();

      assert.strictEqual(fakeLogBook.callCount, 1, "logBook should be called once");
    });
  });

  describe('.exit()', (): void => {
    it('should console log good-bye message and close app', async (): Promise<void> => {
      // Fake process.exit
      const processExitFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(process, 'exit', processExitFake);

      await ReadingListManager.exit();


      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 2);
      assert.strictEqual(processExitFake.callCount, 1);
    });
  });

});
