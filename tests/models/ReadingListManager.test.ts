import { assert } from 'chai';
import sinon from 'sinon';
import ReadingListManager from '../../src/models/ReadingListManager';
import ReadingList from '../../src/models/ReadingList';
import User from  '../../src/models/User';
import db from '../../src/sequelize/models';
import emoji from 'node-emoji';
import chalk from 'chalk';
import inquirer from 'inquirer';
import actions from '../../src/models/actions'
import {
  bornACrimeInfo,
  makeWayForDucklingsInfo,
  whereTheCrawdadsSingInfo
} from '../_testHelpers/BookInstances';
import messages from '../../src/utilities/messages';

const googleResults = [
  bornACrimeInfo,
  makeWayForDucklingsInfo,
  whereTheCrawdadsSingInfo,
];

let defaultUser;


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

    it('should call on readingListManager#promptNextAction', (): void => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);

      const promptNextActionFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager, 'promptNextAction', promptNextActionFake);

      readingListManager.start();
      assert.strictEqual(promptNextActionFake.callCount, 1);
    });
  });

  describe('#promptNextAction()', async (): Promise<void> => {
    it('should return search, viewList, removeBook, and exit, given book(s) in reading list', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      const promptChoices = await readingListManager.preparePromptChoices(2);

      assert.sameDeepMembers(promptChoices, [{
          name: emoji.get('mag') + " Search for books!",
          value: 'search',
        }, {
          name: emoji.get('books') + " View your reading list (2 books)",
          value: 'viewList',
        }, {
          name: emoji.get('no_entry_sign') + ` Remove book(s) from your reading list`,
          value: "removeBook",
        },
        new inquirer.Separator(),
        {
          name: emoji.get('closed_lock_with_key') + "  Exit",
          value: "exit",
        },
        new inquirer.Separator(),
      ]);
    });

    it('should return addBook given book(s) in readingListManager.googleResults', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.googleResults = googleResults;
      const promptChoices = await readingListManager.preparePromptChoices(3);

      assert.sameDeepMembers(promptChoices, [{
          name: emoji.get('mag') + " Search for books!",
          value: 'search',
        }, {
          name: emoji.get('books') + " View your reading list (3 books)",
          value: 'viewList',
        }, {
          name: emoji.get('star') + " Add book(s) above to your reading list",
          value: "addBook",
        }, {
          name: emoji.get('no_entry_sign') + ` Remove book(s) from your reading list`,
          value: "removeBook",
        },
        new inquirer.Separator(),
        {
          name: emoji.get('closed_lock_with_key') + "  Exit",
          value: "exit",
        },
        new inquirer.Separator(),
      ]);
    });

    it('should not return removeBook and viewList given no books', async (): Promise<void> => {
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
      await ReadingList.addBook(bornACrimeInfo, defaultUser);
    });

    it('should call actions.Search.start() if user selects search', async (): Promise<void> => {
      const fakeSearchStart: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(actions.Search, 'start', fakeSearchStart);

      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.performAction('search');

      assert.strictEqual(fakeSearchStart.callCount, 1);
    });
  });

  describe('messages', (): void => {
    it('should console log information about the book', async (): Promise<void> => {
      messages.logOneBook({
        title: bornACrimeInfo.title,
        authors: bornACrimeInfo.authors,
        publisher: null,
      });

      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 3);

      const arg1: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg1, chalk.bold(bornACrimeInfo.title));
      const arg2: string = fdCLI.fakes.consoleLogFake.getCall(1).lastArg;
      assert.strictEqual(arg2, "Author(s): " + bornACrimeInfo.authors[0]);
      const arg3: string = fdCLI.fakes.consoleLogFake.getCall(2).lastArg;
      assert.strictEqual(arg3, "Publisher: N/A\n");
    });

    it('should console log the title with emoji if provided a number', async (): Promise<void> => {
      messages.logOneBook({
        title: bornACrimeInfo.title,
        authors: bornACrimeInfo.authors,
        publisher: null,
      }, 0);

      const arg: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg, `${emoji.get('one')}  ${chalk.bold(bornACrimeInfo.title)}`);
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

  describe('#preparePromptChoices()', () => {
    it('should prompt user to go to next page if there are more than 10 books', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 1;
      const promptChoices = await readingListManager.preparePromptChoices(11);

      assert.deepInclude(promptChoices, {
        name: emoji.get('arrow_forward') + "  Next page",
        value: 'next',
      });
    });

    it('should not prompt user to go to next page if they are on the last page', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 2;
      const promptChoices = await readingListManager.preparePromptChoices(11);

      assert.notDeepInclude(promptChoices, {
        name: emoji.get('arrow_forward') + "  Next page",
        value: 'next',
      });
    });

    it('should prompt user to go to back page if they are past the first page', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 2;
      const promptChoices = await readingListManager.preparePromptChoices(11);

      assert.deepInclude(promptChoices, {
        name: emoji.get('arrow_backward') + "  Previous page",
        value: "previous",
      });
    });

    it('should not prompt user to go to back page if they are on the first page', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 1;
      const promptChoices = await readingListManager.preparePromptChoices(11);

      assert.notDeepInclude(promptChoices, {
        name: emoji.get('arrow_backward') + "  Previous page",
        value: "previous",
      });
    });
  });

  describe('#performAction()', (): void => {
    it('selecting next should increase page', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 1;

      readingListManager.performAction('next');

      assert.strictEqual(readingListManager.readingListPage, 2);
    });

    it('selecting back should decrease page', async (): Promise<void> => {
      const readingListManager: ReadingListManager = new ReadingListManager(defaultUser);
      readingListManager.readingListPage = 2;

      readingListManager.performAction('previous');

      assert.strictEqual(readingListManager.readingListPage, 1);
    });
  });
});
