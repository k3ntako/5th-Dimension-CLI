import { assert } from 'chai';
import db from '../src/sequelize/models';
import ReadingList from '../src/models/ReadingList';
import sinon from 'sinon';
import fs from 'fs';
const migrateToJSON = require('../src/tasks/migrateToJSON').migrateToJSON;

const environment = process.env.NODE_ENV;
const config = require('../config')[environment || "production"];

const params = [
  {
    title: 'A Minute to Midnight', authors: [{name: 'David Baldacci'}], publisher: 'Grand Central Publishing',
    isbn_10: '1538761602', isbn_13: '9781538761601',
  }, {
    title: 'The Guardians', authors: [{name: 'Ana Castillo'}], publisher: 'Random House Publishing Group',
    isbn_10: '0307485722', isbn_13: '9780307485724'
  }, {
    title: 'Twisted Twenty-Six', authors: [{name: 'Janet Evanovich'}], publisher: 'Penguin',
    isbn_10: '0399180206', isbn_13: '9780399180200',
  }, {
    title: 'Gmail', authors: [{name: 'Pro Review'}], publisher: null,
    isbn_10: null, isbn_13: null,
  },
];

const params2 = [
  {
    title: 'Why We Sleep', authors: [{ name: 'Matthew Walker' }], publisher: 'Simon and Schuster',
    isbn_10: '1501144316', isbn_13: '9781501144318',
  }
];

describe('migrateToJSON', (): void => {
  it('should create JSON file with content from database', async (): Promise<void> => {
    try {
      fs.unlinkSync(config.dataFileDir); // delete test_data.json file
    } catch (error) {
      console.warn(error.message); // likely file didn't exist
    }

    // fake process.exit
    const processExitFake: sinon.SinonSpy<any> = sinon.fake();
    sinon.replace(process, 'exit', processExitFake);

    // create user
    const user = await db.User.create({
      first_name: 'Test_First',
      last_name: 'Test_Last',
      email: "default@example.com",
    });

    // create books and associations
    for (let param of params){
      const book = await db.Book.create(param, {
        include: [{
          association: db.Book.associations.authors,
        }],
      });

      await user.addBook(book);
    }

    await migrateToJSON();

    const books = ReadingList.importFromJSON(config.dataFileDir);

    assert.lengthOf(books, 3); // The last book, Gmail, does not have an ISBN, so it will not be added

    books.forEach((book) => {
      assert.exists(book.id);
      assert.exists(book.title);
      assert.exists(book.publisher);
      assert.exists(book.authors);
    });

    const call0args0 = fdCLI.fakes.consoleLogFake.getCall(0).args[0];
    assert.strictEqual(call0args0, '3 book(s) transferred!');

    const call1args0 = fdCLI.fakes.consoleLogFake.getCall(1).args[0];
    const call1args1 = fdCLI.fakes.consoleLogFake.getCall(1).args[1];

    assert.isTrue(call1args0.startsWith('Following books were not added: '));
    assert.deepInclude(call1args1[0], {
      title: params[3].title,
      authors: [params[3].authors[0].name],
      publisher: params[3].publisher,
    });
  });

  it('should add to data file if file already exists', async (): Promise<void> => {
    // fake process.exit
    const processExitFake: sinon.SinonSpy<any> = sinon.fake();
    sinon.replace(process, 'exit', processExitFake);

    // create user
    const users = await db.User.findAll({
      where: {
        email: "default@example.com",
      },
    });

    const user = users[0];

    // create books and associations
    const param = params2[0];
    const book = await db.Book.create(param, {
      include: [{
        association: db.Book.associations.authors,
      }],
    });

    await user.addBook(book);

    await migrateToJSON();

    const books = ReadingList.importFromJSON(config.dataFileDir);

    assert.lengthOf(books, 4); // 3 added in first test, and 1 added in this test
  });
});

