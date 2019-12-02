import { assert } from 'chai';
import sinon from 'sinon';
import start from '../src/index';
import ReadingListManager from '../src/models/ReadingListManager';


describe('index.ts', (): void => {
  describe('start()', (): void => {
    it('should call ReadingListManager#start()', async (): Promise<void> => {
      const startFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(ReadingListManager.prototype, 'start', startFake);

      await start();

      assert.strictEqual(startFake.callCount, 1);
    });

    it('should catch errors and close the app', async (): Promise<void> => {
      // Simulate ReadingListManager#start throwing an error
      const startFake: sinon.SinonSpy<any> = sinon.fake.throws(new Error('Something went wrong'));
      sinon.replace(ReadingListManager.prototype, 'start', startFake);

      // Fake process.exit
      const processExitStub: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(process, 'exit', processExitStub);

      await start();

      assert.strictEqual(fdCLI.fakes.consoleErrorFake.callCount, 3);
      assert.strictEqual(processExitStub.callCount, 1);
    });
  });
});

