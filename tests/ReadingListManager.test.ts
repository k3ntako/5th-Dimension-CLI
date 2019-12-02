import { assert } from 'chai';
import sinon from 'sinon';
import ReadingListManager from '../src/models/ReadingListManager';
import ReadingList from '../src/models/ReadingList';
import Book from '../src/models/Book';
import emoji from 'node-emoji';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';

const config = require('../config').test;

//deletes test_data.json
const deleteDataFile = () => {
  try {
    fs.unlinkSync(config.dataFileDir);
  } catch (error) {
    console.warn(error);
  }
}


const bookInfo0 = {
  id: "BORNACRIME",
  title: 'Born a Crime',
  authors: ['Trevor Noah'],
  publisher: 'Spiegel & Grau',
}

const bookInfo1 = {
  id: "MAKEWAYFOR",
  title: "Make Way for Ducklings",
  authors: ["Robert McCloskey"],
  publisher: "Puffin Books",
};

const bookInfo2 = {
  id: "WHERETHE",
  title: "Where the Crawdads Sing",
  authors: ["Delia Owens"],
  publisher: "Penguin",
};

describe('ReadingListManager', (): void => {
  describe('#start()', (): void => {
    it('should console log welcome message', (): void => {
      const readingListManager: ReadingListManager = new ReadingListManager();

      const fakeQuestion: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(readingListManager, 'question', fakeQuestion);

      readingListManager.start();
      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 2);

      const arg1: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg1, `Welcome to ${chalk.cyanBright.bold("5th Dimension CLI")}!`);
      const arg2: string = fdCLI.fakes.consoleLogFake.getCall(1).lastArg;
      assert.strictEqual(arg2, "It's place to discover new books and save them for later!");
    });

    it('should call on readingListManager#question', (): void => {
      const readingListManager: ReadingListManager = new ReadingListManager();

      const questionFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager, 'question', questionFake);

      readingListManager.start();
      assert.strictEqual(questionFake.callCount, 1);
    });
  });

  describe('#question()', async (): Promise<void> => {
    it('should call ReadingListManager.prompt with appropriate arguments', async (): Promise<void> => {
      deleteDataFile();

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();
      readingListManager.readingList.addBook(bookInfo0);

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
        },
        new inquirer.Separator(),
      ]);
    });

    it('should call ReadingListManager#promptSearch if user selects search', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "search" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();
      const fakePromptSearch: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager, 'promptSearch', fakePromptSearch);
      await readingListManager.question();
      assert.strictEqual(fakePromptSearch.callCount, 1);
    });

    it('should ask if user would like to add books to reading list if there are search results', async (): Promise<void> => {
      const book: Book = new Book(bookInfo0);

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();
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

      const readingListManager: ReadingListManager = new ReadingListManager();
      const fakeViewList: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager, 'viewList', fakeViewList);
      await readingListManager.question();
      assert.strictEqual(fakeViewList.callCount, 1);
    });
  });

  describe('.logBook', (): void => {
    it('should console log information about the book', async (): Promise<void> => {
      const bookInfo0WithoutPublisher = Object.assign({}, bookInfo0, { publisher: null });

      ReadingListManager.logBook(bookInfo0WithoutPublisher);

      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 3);

      const arg1: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg1, chalk.bold(bookInfo0.title));
      const arg2: string = fdCLI.fakes.consoleLogFake.getCall(1).lastArg;
      assert.strictEqual(arg2, "Author(s): " + bookInfo0.authors[0]);
      const arg3: string = fdCLI.fakes.consoleLogFake.getCall(2).lastArg;
      assert.strictEqual(arg3, "Publisher: N/A\n");
    });

    it('should console log the title with emoji if provided a number', async (): Promise<void> => {
      ReadingListManager.logBook(bookInfo0, 0);

      const arg: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg, `${emoji.get('one')}  ${chalk.bold(bookInfo0.title)}`);
    });
  });

  describe('#promptSearch()', (): void => {
    it('should fetch a books from Google Books based on search query and console log the results', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ search: bookInfo0.title });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const fakeLogBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(ReadingListManager, 'logBook', fakeLogBook);

      const readingListManager: ReadingListManager = new ReadingListManager();
      await readingListManager.promptSearch();

      const arg: string = fdCLI.fakes.consoleLogFake.lastArg;

      assert.strictEqual(arg, `${chalk.bold("Search results for:")} "${bookInfo0.title}"\n`);
      assert.strictEqual(fakeLogBook.callCount, 5);
    });

    it('should warn user if they enter a blank search', async (): Promise<void> => {
      const promptStub = sinon.stub();
      promptStub.onCall(0).resolves({ search: "  " }); // returns this on first call
      promptStub.resolves({ search: "Hello" }); // returns on every call after first
      sinon.replace(ReadingListManager, 'prompt', promptStub);

      const readingListManager: ReadingListManager = new ReadingListManager();
      await readingListManager.promptSearch();

      const arg = fdCLI.fakes.consoleWarnFake.getCall(0).lastArg;
      assert.include(arg, 'No search term entered');
      assert.include(arg, emoji.get('warning'));
    });
  });

  describe('#promptAddBook()', (): void => {
    it('should call ReadingList.addBook with books selected', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ bookIndices: [0,2] });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      const fakeAddBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager.readingList, 'addBook', fakeAddBook);

      readingListManager.googleResults = [
        new Book(bookInfo0),
        new Book(bookInfo1),
        new Book(bookInfo2),
      ];

      await readingListManager.promptAddBook();

      assert.strictEqual(fakeAddBook.callCount, 2)

      const args0 = fakeAddBook.getCall(0).args[0];
      const args1 = fakeAddBook.getCall(1).args[0];

      assert.include(
        {
          id: args0.id,
          title: args0.title,
          authors: args0.authors,
          publisher: args0.publisher,
        },
        bookInfo0
      );

      assert.include({
        id: args1.id,
        title: args1.title,
        authors: args1.authors,
        publisher: args1.publisher,
      }, {
        title: bookInfo2.title,
        authors: bookInfo2.authors,
        publisher: bookInfo2.publisher,
      });
    });

    it('should console log titles of added books', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ bookIndices: [0, 2] });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      const fakeAddBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager.readingList, 'addBook', fakeAddBook);

      readingListManager.googleResults = [
        new Book(bookInfo0),
        new Book(bookInfo1),
        new Book(bookInfo2),
      ];
      await readingListManager.promptAddBook();

      const args = fdCLI.fakes.consoleLogFake.args;

      const secondToLastArg = args[args.length - 2][0];
      const lastArg = args[args.length - 1][0];
      assert.strictEqual(secondToLastArg, chalk.bold("Book(s) added:"))
      assert.include(lastArg, chalk.greenBright(bookInfo0.title))
      assert.include(lastArg, chalk.greenBright(bookInfo2.title))
    });

    it('should inform user that no books were added if no books were added', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ bookIndices: [] });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      const fakeAddBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager.readingList, 'addBook', fakeAddBook);

      readingListManager.googleResults = [
        new Book(bookInfo0),
        new Book(bookInfo1),
        new Book(bookInfo2),
      ];
      await readingListManager.promptAddBook();

      const arg = fdCLI.fakes.consoleLogFake.lastCall.lastArg;
      assert.strictEqual(fakeAddBook.callCount, 0);
      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 1);
      assert.strictEqual(arg, "No books added");
    });
  });

  describe('#promptRemoveBook()', (): void => {
    it('should call ReadingList.removeBook with books selected', async (): Promise<void> => {
      deleteDataFile();

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ bookIndices: [0] });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      readingListManager.readingList.addBook(bookInfo0);

      const fakeRemoveBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager.readingList, 'removeBook', fakeRemoveBook);

      await readingListManager.promptRemoveBook();

      assert.strictEqual(fakeRemoveBook.callCount, 1);

      const bookId: string = fakeRemoveBook.getCall(0).args[0];

      assert.strictEqual(bookId, bookInfo0.id);
    });

    it('should console log titles of deleted books', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ bookIndices: [0, 1] });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      readingListManager.readingList.addBook(bookInfo0);
      readingListManager.readingList.addBook(bookInfo1);

      const fakeRemoveBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager.readingList, 'removeBook', fakeRemoveBook);

      await readingListManager.promptRemoveBook();

      const args = fdCLI.fakes.consoleLogFake.args;

      const secondToLastArg = args[args.length - 2][0];
      const lastArg = args[args.length - 1][0];
      assert.strictEqual(secondToLastArg, chalk.bold("Books removed:"))
      assert.include(lastArg, chalk.redBright(bookInfo0.title))
      assert.include(lastArg, chalk.redBright(bookInfo1.title))
    });

    it('should inform user that no books were removed if no books were removed', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ bookIndices: [] });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();
      readingListManager.readingList.addBook(bookInfo0);

      const fakeRemoveBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(readingListManager.readingList, 'removeBook', fakeRemoveBook);

      await readingListManager.promptRemoveBook();

      // fakePrompt.arg

      const arg = fdCLI.fakes.consoleLogFake.lastCall.lastArg;
      assert.strictEqual(fakeRemoveBook.callCount, 0);
      assert.strictEqual(arg, "No books removed");
    });
  });

  describe('#viewList()', (): void => {
    it('should not console log books if user has no books in their reading list', async (): Promise<void> => {
      deleteDataFile();

      const fakeLogBook: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(ReadingListManager, 'logBook', fakeLogBook);

      const readingListManager: ReadingListManager = new ReadingListManager();
      await readingListManager.viewList();

      assert.strictEqual(fakeLogBook.callCount, 0, "logBook should not be called");
      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 1, "Console log should be called once");

      const arg: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.strictEqual(arg, "There are no books in your reading list");
    });

    it('should console log reading list', async (): Promise<void> => {
      const fakeLogBook: sinon.SinonSpy < any > = sinon.fake();
      sinon.replace(ReadingListManager, 'logBook', fakeLogBook);

      const readingListManager: ReadingListManager = new ReadingListManager();
      readingListManager.readingList.addBook(bookInfo1);

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

  describe('.next()', (): void => {
    it('should prompt user to go to next page if there are more than 10 books', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      const getCountFake: sinon.SinonSpy<any> = sinon.fake.returns(11);
      sinon.replace(readingListManager.readingList, 'getCount', getCountFake);

      readingListManager.readingListPage = 1;
      await readingListManager.question();

      const args = JSON.stringify(fakePrompt.args[0][0]);

      assert.include(args, JSON.stringify({
        name: emoji.get('arrow_forward') + "  Next page",
        value: 'next',
      }));
    });

    it('should not prompt user to go to next page if they are on the last page', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      const getCountFake: sinon.SinonSpy<any> = sinon.fake.returns(11);
      sinon.replace(readingListManager.readingList, 'getCount', getCountFake);

      readingListManager.readingListPage = 2;
      await readingListManager.question();

      const args = JSON.stringify(fakePrompt.args[0][0]);

      assert.notInclude(args, JSON.stringify({
        name: emoji.get('arrow_forward') + "  Next page",
        value: 'next',
      }));
    });

    it('selecting next should increase page', async (): Promise<void> => {
      deleteDataFile();

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "next" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();
      const getCountFake: sinon.SinonSpy<any> = sinon.fake.returns(15);
      sinon.replace(readingListManager.readingList, 'getCount', getCountFake);

      readingListManager.readingListPage = 1;
      await readingListManager.question();

      assert.strictEqual(readingListManager.readingListPage, 2);
    });

    it('should prompt user to go to back page if they are past the first page', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      const getCountFake: sinon.SinonSpy<any> = sinon.fake.returns(11);
      sinon.replace(readingListManager.readingList, 'getCount', getCountFake);

      readingListManager.readingListPage = 2;
      await readingListManager.question();

      const args = JSON.stringify(fakePrompt.args[0][0]);

      assert.include(args, JSON.stringify({
        name: emoji.get('arrow_backward') + "  Previous page",
        value: "previous",
      }));
    });

    it('should not prompt user to go to back page if they are on the first page', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "nothing" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      const getCountFake: sinon.SinonSpy<any> = sinon.fake.returns(11);
      sinon.replace(readingListManager.readingList, 'getCount', getCountFake);

      readingListManager.readingListPage = 1;
      await readingListManager.question();

      const args = JSON.stringify(fakePrompt.args[0][0]);

      assert.notInclude(args, JSON.stringify({
        name: emoji.get('arrow_backward') + "  Previous page",
        value: "previous",
      }));
    });

    it('selecting back should decrease page', async (): Promise<void> => {
      deleteDataFile();

      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "previous" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();

      const getCountFake: sinon.SinonSpy<any> = sinon.fake.returns(17);
      sinon.replace(readingListManager.readingList, 'getCount', getCountFake);

      readingListManager.readingListPage = 2;
      await readingListManager.question();

      assert.strictEqual(readingListManager.readingListPage, 1);
    });
  });
});
