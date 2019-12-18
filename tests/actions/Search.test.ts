import { assert } from 'chai';
import sinon from 'sinon';
import inquirer from 'inquirer';
import actions from '../../src/models/actions'
import {
  bornACrimeInfo,
} from '../_testHelpers/BookInstances';
import messages from '../../src/utilities/messages';
import ReadingListManager from '../../src/models/ReadingListManager';
import User from '../../src/models/User';

let defaultUser;

describe('Search action', (): void => {
  before(async () => {
    defaultUser = await User.loginAsDefault();
  });

  describe('#promptSearch()', (): void => {
    it('should fetch a books from Google Books based on search query ', async (): Promise<void> => {
      const fakePrompt = sinon.fake.resolves({ searchStr: bornACrimeInfo.title });
      sinon.replace(inquirer, 'prompt', fakePrompt);

      const {googleResults} = await actions.Search.start();

      const firstBook = googleResults[0];
      assert.strictEqual(firstBook.title, bornACrimeInfo.title);
      assert.lengthOf(googleResults, 5);
    });

    it('should console log the results', async (): Promise<void> => {
      const readingListManager = new ReadingListManager(defaultUser);

      // replace readingListManager.prompt
      const fakePrompt = sinon.fake.resolves({ action: "search" });
      sinon.replace(readingListManager, 'prompt', fakePrompt);

      // replace setTimeout so it doesn't as another question
      const fakeSetTimeout = sinon.fake();
      sinon.replace(global, 'setTimeout', fakeSetTimeout);

      // fake user input
      const fakeSearchPrompt = sinon.fake.resolves({ searchStr: bornACrimeInfo.title });
      sinon.replace(inquirer, 'prompt', fakeSearchPrompt);

      // fake messages
      const fakeLogOneBook = sinon.fake();
      sinon.replace(messages, 'logOneBook', fakeLogOneBook);

      // call method
      await readingListManager.question();

      const args = fakeLogOneBook.args;

      assert.lengthOf(args, 5);
    });
  });
});
