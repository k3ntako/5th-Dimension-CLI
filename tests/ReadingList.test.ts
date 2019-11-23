import { assert } from 'chai';
import ReadingList from '../src/models/ReadingList';
import User from '../src/models/User';

import { Book as DBBook, User as DBUser, UserBook } from '../src/sequelize/models';
import Book from '../src/models/Book';

const params = {
  title: "Test-driven Development",
  publisher: "Addison-Wesley Professional",
  authors: ["Kent Beck"],
  isbn_10: "0321146530",
  isbn_13: "9780321146533",
  issn: null,
  other_identifier: null,
}

const params2 = {
  title: "Eloquent JavaScript",
  publisher: "No Starch Press",
  authors: ["Marijn Haverbeke"],
  isbn_10: "1593272820",
  isbn_13: "9781593272821",
  issn: null,
  other_identifier: null,
}

const bookInstance = new Book (params);
let defaultUser, defaultDBUser;

describe('ReadingList', (): void => {
  before(async () => {
    defaultUser = await User.loginAsDefault();
    defaultDBUser = await DBUser.findByPk(defaultUser.id)
  });

  describe('.addBook', (): void => {
    it('should add a book to the database', async (): Promise<void> => {
      await ReadingList.addBook(bookInstance, defaultUser);

      // Find the book above
      const books = await DBBook.findAll({
        where: {
          isbn_13: bookInstance.isbn_13,
        },
      });

      assert.lengthOf(books, 1);

      // The book should have all the fields provided.
      // Remove the "authors" field because it's a bit more complicated to test,
      // and the AuthorBook relationship is already tested elsewhere.
      let paramsWithoutAuthors = Object.assign({}, params);
      delete paramsWithoutAuthors.authors;

      const book = await books[0].toJSON();

      assert.include(book, paramsWithoutAuthors);
    });


    it('should not add a book twice (ISBN)', async (): Promise<void> => {
      // Add the same book twice
      const book1 = await ReadingList.addBook(bookInstance, defaultUser);
      const book2 = await ReadingList.addBook(bookInstance, defaultUser);

      assert.strictEqual(book1.id, book2.id);
    });

    it('should not add a book twice (ISSN)', async (): Promise<void> => {
      const paramsISSN = Object.assign({}, params, {
        isbn_10: null,
        isbn_13: null,
        issn: "3129873221231",
      });

      // Add the same book twice
      const book1 = await ReadingList.addBook(paramsISSN, defaultUser);
      const book2 = await ReadingList.addBook(paramsISSN, defaultUser);

      assert.strictEqual(book1.id, book2.id);
    });

    it('should not add a book twice (other identifiers)', async (): Promise<void> => {
      const paramsOtherIdentifier = Object.assign({}, params, {
        isbn_10: null,
        isbn_13: null,
        other_identifier: "Harvard:3129873221231",
      });

      // Add the same book twice
      const book1 = await ReadingList.addBook(paramsOtherIdentifier, defaultUser);
      const book2 = await ReadingList.addBook(paramsOtherIdentifier, defaultUser);

      assert.strictEqual(book1.id, book2.id);
    });

    it('should not add a book twice (no identifiers)', async (): Promise<void> => {
      const paramsWithoutIdentifiers = Object.assign({}, params, {
        isbn_10: null,
        isbn_13: null,
      });

      // Add the same book twice
      const book1 = await ReadingList.addBook(paramsWithoutIdentifiers, defaultUser);
      const book2 = await ReadingList.addBook(paramsWithoutIdentifiers, defaultUser);

      assert.strictEqual(book1.id, book2.id);
    });

    it('should add book to ReadingList', async (): Promise<void> => {
      const createdBook = await ReadingList.addBook(params2, defaultUser);

      // get books associated with defaultUser with the same ISBN
      const books = await defaultDBUser.getBooks({
        where: { isbn_13: params2.isbn_13 },
      });

      const associatedBook = await books[0].toJSON();

      assert.strictEqual(createdBook.id, associatedBook.id);
    });
  });

  describe('.getList', (): void => {
    before(async (): Promise<void> => {
      // Delete all the books added above
      await UserBook.destroy({ where: {} });
      await ReadingList.addBook(bookInstance, defaultUser);
    });

    it('should return reading list', async (): Promise<void> => {
      const books = await ReadingList.getList(defaultUser);
      assert.lengthOf(books, 1);

      // The book should have all the fields provided.
      // Remove the "authors" field because it's a bit more complicated to test,
      // and the AuthorBook relationship is already tested elsewhere.
      let paramsWithoutAuthors = Object.assign({}, params);
      delete paramsWithoutAuthors.authors;

      assert.include(books[0], paramsWithoutAuthors);
    });
  })
});
