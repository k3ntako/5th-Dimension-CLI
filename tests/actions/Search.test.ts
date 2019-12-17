import { assert } from 'chai';
import sinon from 'sinon';
import ReadingList from '../../src/models/ReadingList';
import User from  '../../src/models/User';
import db from '../../src/sequelize/models';
import chalk from 'chalk';
import inquirer from 'inquirer';
import actions from '../../src/models/actions'

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

describe('Search action', (): void => {
  describe('#promptSearch()', (): void => {
    before(async () => {
      defaultUser = await User.loginAsDefault();


      // await db.UserBook.destroy({ where: {} });
      // await ReadingList.addBook(bookInfo1, defaultUser);
    });

    it('should fetch a books from Google Books based on search query ', async (): Promise<void> => {
      const fakePrompt = sinon.fake.resolves({ searchStr: bookInfo1.title });
      sinon.replace(inquirer, 'prompt', fakePrompt);

      const {googleResults} = await actions.Search.start();

      const firstBook = googleResults[0];
      assert.strictEqual(firstBook.title, bookInfo1.title);
      assert.lengthOf(googleResults, 5);
    });

    it('should console log the results', async (): Promise<void> => {
      const fakePrompt = sinon.fake.resolves({ searchStr: bookInfo1.title });
      sinon.replace(inquirer, 'prompt', fakePrompt);

      const fakeLogOneBook = sinon.fake();
      sinon.replace(actions.Search.prototype, 'logOneBook', fakeLogOneBook);


      await actions.Search.start();

      const args = fakeLogOneBook.args;

      assert.lengthOf(args, 5);
    });
  });
});
