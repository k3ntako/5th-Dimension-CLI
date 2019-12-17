import { assert } from 'chai';
import sinon from 'sinon';
import ReadingListManager from '../../src/models/ReadingListManager';
import ReadingList from '../../src/models/ReadingList';
import Book from '../../src/models/Book';
import User from  '../../src/models/User';
import db from '../../src/sequelize/models';
import emoji from 'node-emoji';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { UserBook } from '../../src/sequelize/models/user_book';
import book from '../../src/sequelize/models/book';
import actions from '../../src/models/actions'
import Action from '../../src/models/actions/Action'

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
      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 3);
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
    it('should return search, view_list, remove_book, and exit, given book(s) in reading list', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      const promptChoices = await readingListManager.preparePromptChoices(2);

      assert.sameDeepMembers(promptChoices, [{
          name: emoji.get('mag') + " Search for books!",
          value: 'search',
        }, {
          name: emoji.get('books') + " View your reading list (2 books)",
          value: 'view_list',
        }, {
          name: emoji.get('no_entry_sign') + ` Remove book(s) from your reading list`,
          value: "remove_book",
        },
        new inquirer.Separator(),
        {
          name: emoji.get('closed_lock_with_key') + "  Exit",
          value: "exit",
        },
        new inquirer.Separator(),
      ]);
    });

    it('should return add_book given book(s) in readingListManager.googleResults', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.googleResults = [ bookInfo1 ];
      const promptChoices = await readingListManager.preparePromptChoices(2);

      assert.sameDeepMembers(promptChoices, [{
          name: emoji.get('mag') + " Search for books!",
          value: 'search',
        }, {
          name: emoji.get('books') + " View your reading list (2 books)",
          value: 'view_list',
        }, {
          name: emoji.get('star') + " Add book(s) above to your reading list",
          value: "add_book",
        }, {
          name: emoji.get('no_entry_sign') + ` Remove book(s) from your reading list`,
          value: "remove_book",
        },
        new inquirer.Separator(),
        {
          name: emoji.get('closed_lock_with_key') + "  Exit",
          value: "exit",
        },
        new inquirer.Separator(),
      ]);
    });

    it('should not return remove_book and view_list given no books', async (): Promise<void> => {
      await db.UserBook.destroy({ where: {} });

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      const promptChoices = await readingListManager.preparePromptChoices(0);

      assert.sameDeepMembers(promptChoices, [{
          name: emoji.get('mag') + " Search for books!",
          value: 'search',
        },
        new inquirer.Separator(),
        {
          name: emoji.get('closed_lock_with_key') + "  Exit",
          value: "exit",
        },
        new inquirer.Separator(),
      ]);
    });
  });


  describe('#performAction()', async (): Promise<void> => {
    before(async (): Promise<void> => {
      await db.UserBook.destroy({ where: {} });
      await ReadingList.addBook(bookInfo1, defaultUser);
    });

    it('should call actions.Search.start() if user selects search', async (): Promise<void> => {
      const fakeSearchStart: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(actions.Search, 'start', fakeSearchStart);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.performAction('search');

      assert.strictEqual(fakeSearchStart.callCount, 1);
    });

    it('should call actions.ViewList.start() if user selects view_list', async (): Promise<void> => {
      const fakeViewListStart: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(actions.ViewList, 'start', fakeViewListStart);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.performAction('view_list');

      assert.strictEqual(fakeViewListStart.callCount, 1);
    });
  });

  describe('.logBook', (): void => {
    it('should console log information about the book', async (): Promise<void> => {
      const action = new Action();
      action.logOneBook({
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
      const action = new Action();
      action.logOneBook({
        title,
        authors,
        publisher: null,
      }, 0);

      const arg: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg, `${emoji.get('one')}  ${chalk.bold(title)}`);
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

  describe('.next()', (): void => {
    it('should prompt user to go to next page if there are more than 10 books', async (): Promise<void> => {
      const getCountFake: sinon.SinonSpy<any> = sinon.fake.resolves(11);
      sinon.replace(ReadingList, 'getCount', getCountFake);

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 1;
      await readingListManager.question();

      const args = JSON.stringify(fakePrompt.args[0][0]);

      assert.include(args, JSON.stringify({
        name: emoji.get('arrow_forward') + "  Next page",
        value: 'next',
      }));
    });

    it('should not prompt user to go to next page if they are on the last page', async (): Promise<void> => {
      const getCountFake: sinon.SinonSpy<any> = sinon.fake.resolves(11);
      sinon.replace(ReadingList, 'getCount', getCountFake);

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 2;
      await readingListManager.question();

      const args = JSON.stringify(fakePrompt.args[0][0]);

      assert.notInclude(args, JSON.stringify({
        name: emoji.get('arrow_forward') + "  Next page",
        value: 'next',
      }));
    });

    it('selecting next should increase page', async (): Promise<void> => {
      // destroy all books
      await db.Book.destroy({ where: {} });

      // Add 12 books to reading list
      const promises = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(title => {
        return db.Book.create({ title }).then(book => defaultUser.addBook(book));
      });

      await Promise.all(promises);

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "next" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 1;
      await readingListManager.question();

      assert.strictEqual(readingListManager.readingListPage, 2);
    });

    it('should prompt user to go to back page if they are past the first page', async (): Promise<void> => {
      const getCountFake: sinon.SinonSpy<any> = sinon.fake.resolves(11);
      sinon.replace(ReadingList, 'getCount', getCountFake);

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 2;
      await readingListManager.question();

      const args = JSON.stringify(fakePrompt.args[0][0]);

      assert.include(args, JSON.stringify({
        name: emoji.get('arrow_backward') + "  Previous page",
        value: "previous",
      }));
    });

    it('should not prompt user to go to back page if they are on the first page', async (): Promise<void> => {
      const getCountFake: sinon.SinonSpy<any> = sinon.fake.resolves(11);
      sinon.replace(ReadingList, 'getCount', getCountFake);

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 1;
      await readingListManager.question();

      const args = JSON.stringify(fakePrompt.args[0][0]);

      assert.notInclude(args, JSON.stringify({
        name: emoji.get('arrow_backward') + "  Previous page",
        value: "previous",
      }));
    });

    it('selecting back should decrease page', async (): Promise<void> => {
      // destroy all books
      await db.Book.destroy({ where: {} });

      // Add 12 books to reading list
      const promises = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(title => {
        return db.Book.create({ title }).then(book => defaultUser.addBook(book));
      });

      await Promise.all(promises);

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "previous" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 2;
      await readingListManager.question();

      assert.strictEqual(readingListManager.readingListPage, 1);
    });
  });
});
