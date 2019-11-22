import { assert, expect } from 'chai';
import sinon from 'sinon';
import ReadingListManager from '../src/models/ReadingListManager';
import { IBook } from '../src/utilities/interfaces';

describe('ReadingListManager', (): void => {
  describe('#start()', (): void => {
    it('should console.log welcome message', (): void => {
      const readingListManager: ReadingListManager = new ReadingListManager();
      readingListManager.start();
      assert.strictEqual(fd2.fakes.consoleLogFake.callCount, 2);
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
      sinon.replace(readingListManager.bookSearch, 'promptSearch', fakePromptSearch);
      await readingListManager.question();
      assert.strictEqual(fakePromptSearch.callCount, 1);
      sinon.restore();
    });
  });
});
