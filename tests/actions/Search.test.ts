import { assert } from 'chai';
import sinon from 'sinon';
import inquirer from 'inquirer';
import actions from '../../src/models/actions'

import {
  bornACrimeInfo,
  makeWayForDucklingsInfo,
  whereTheCrawdadsSingInfo
} from '../_testHelpers/books';


describe('Search action', (): void => {
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
      const fakePrompt = sinon.fake.resolves({ searchStr: bornACrimeInfo.title });
      sinon.replace(inquirer, 'prompt', fakePrompt);

      const fakeLogOneBook = sinon.fake();
      sinon.replace(actions.Search.prototype, 'logOneBook', fakeLogOneBook);


      await actions.Search.start();

      const args = fakeLogOneBook.args;

      assert.lengthOf(args, 5);
    });
  });
});
