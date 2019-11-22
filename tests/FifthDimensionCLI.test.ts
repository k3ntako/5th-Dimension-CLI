import { assert } from 'chai';
import sinon from 'sinon';
import FifthDimensionCLI from '../src/index';
import ReadingListManager from '../src/models/ReadingListManager';


describe('FifthDimensionCLI', (): void => {
  describe('.start()', (): void => {
    it('should called ReadingListManager#start()', (): void => {
      const startFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(ReadingListManager.prototype, 'start', startFake);

      FifthDimensionCLI.start();

      assert.strictEqual(startFake.callCount, 1);
    });
  });
});

