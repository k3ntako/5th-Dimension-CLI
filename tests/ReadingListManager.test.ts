import { assert, expect } from 'chai';
import sinon from 'sinon';
import ReadingListManager from '../src/models/ReadingListManager';
import { IBook } from '../src/utilities/interfaces';

describe('ReadingListManager', (): void => {
  describe('#start()', (): void => {
    it('should console.log welcome message', (): void => {
      const readingListManager: ReadingListManager = new ReadingListManager();
      readingListManager.start();
      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 2);
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
    it('should call BookSearch#promptSearch if user selects search', async (): Promise<void> => {
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "search" });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();
      const fakePromptSearch: sinon.SinonSpy<any> = sinon.fake.resolves({ action: "search" });
      sinon.replace(readingListManager, 'promptSearch', fakePromptSearch);
      await readingListManager.question();
      assert.strictEqual(fakePromptSearch.callCount, 1);
      sinon.restore();
    });
  });

  describe('#promptSearch()', (): void => {
    it('should fetch a books from Google Books based on BookSearch#searchStr', async (): Promise<void> => {
      const bookName: string = "Born a Crime";
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ search: bookName });
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const readingListManager: ReadingListManager = new ReadingListManager();
      await readingListManager.promptSearch();

      assert.strictEqual(fdCLI.fakes.consoleLogFake.callCount, 21);


      const arg0: string = fdCLI.fakes.consoleLogFake.getCall(0).lastArg;
      assert.include(arg0, `Search results: "${bookName}"`);
      const arg1: string = fdCLI.fakes.consoleLogFake.getCall(1).lastArg;
      assert.include(arg1, "Born a Crime");
      const arg2: string = fdCLI.fakes.consoleLogFake.getCall(2).lastArg;
      assert.include(arg2, "Author(s): ");
      const arg3: string = fdCLI.fakes.consoleLogFake.getCall(3).lastArg;
      assert.include(arg3, "Publisher: ");
    });
  });
});
