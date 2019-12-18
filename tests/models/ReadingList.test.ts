import { assert } from 'chai';
import ReadingList from '../../src/models/ReadingList';
import User from '../../src/models/User';
import Book from '../../src/models/Book';
import db from '../../src/sequelize/models';

const tddParams = {
  title: "Test-driven Development",
  publisher: "Addison-Wesley Professional",
  authors: ["Kent Beck"],
  isbn_10: "0321146530",
  isbn_13: "9780321146533",
  issn: null,
  other_identifier: null,
}

const eloquentJSParams = {
  title: "Eloquent JavaScript",
  publisher: "No Starch Press",
  authors: ["Marijn Haverbeke"],
  isbn_10: "1593272820",
  isbn_13: "9781593272821",
  issn: null,
  other_identifier: null,
}

let defaultUser;

describe('ReadingList', (): void => {
  before(async () => {
    defaultUser = await User.loginAsDefault();
  });

  describe('.addBook', (): void => {
    it('should add a book to the database', async (): Promise<void> => {
      await ReadingList.addBook(tddParams, defaultUser);

      // Find the book above
      const books = await db.Book.findAll({
        where: {
          isbn_13: tddParams.isbn_13,
        },
      });

      assert.lengthOf(books, 1);

      // The book should have all the fields provided.
      // Remove the "authors" field because it's a bit more complicated to test,
      // and the AuthorBook relationship is already tested elsewhere.
      const tddParamsWithoutAuthors = Object.assign({}, tddParams);
      delete tddParamsWithoutAuthors.authors;

      const book = await books[0].toJSON();

      assert.include(book, tddParamsWithoutAuthors);
    });


    it('should not add a book twice (ISBN)', async (): Promise<void> => {
      // Add the same book twice
      const tddFirstAdd = await ReadingList.addBook(tddParams, defaultUser);
      const tddSecondAdd = await ReadingList.addBook(tddParams, defaultUser);

      assert.strictEqual(tddFirstAdd.id, tddSecondAdd.id);
    });

    it('should not add a book twice (ISSN)', async (): Promise<void> => {
      const tddParamsWithISSN = Object.assign({}, tddParams, {
        isbn_10: null,
        isbn_13: null,
        issn: "3129873221231",
      });

      // Add the same book twice
      const tddFirstAdd = await ReadingList.addBook(tddParamsWithISSN, defaultUser);
      const tddSecondAdd = await ReadingList.addBook(tddParamsWithISSN, defaultUser);

      assert.strictEqual(tddFirstAdd.id, tddSecondAdd.id);
    });

    it('should not add a book twice (other identifiers)', async (): Promise<void> => {
      const tddParamsWithOtherIdentifier = Object.assign({}, tddParams, {
        isbn_10: null,
        isbn_13: null,
        other_identifier: "Harvard:3129873221231",
      });

      // Add the same book twice
      const tddFirstAdd = await ReadingList.addBook(tddParamsWithOtherIdentifier, defaultUser);
      const tddSecondAdd = await ReadingList.addBook(tddParamsWithOtherIdentifier, defaultUser);

      assert.strictEqual(tddFirstAdd.id, tddSecondAdd.id);
    });

    it('should not add a book twice (no identifiers)', async (): Promise<void> => {
      const tddParamsWithoutIdentifiers = Object.assign({}, tddParams, {
        isbn_10: null,
        isbn_13: null,
      });

      // Add the same book twice
      const tddFirstAdd = await ReadingList.addBook(tddParamsWithoutIdentifiers, defaultUser);
      const tddSecondAdd = await ReadingList.addBook(tddParamsWithoutIdentifiers, defaultUser);

      assert.strictEqual(tddFirstAdd.id, tddSecondAdd.id);
    });

    it('should add book to ReadingList', async (): Promise<void> => {
      const createdBook = await ReadingList.addBook(eloquentJSParams, defaultUser);

      // get books associated with defaultUser with the same ISBN
      const books = await defaultUser.getBooks({
        where: { isbn_13: eloquentJSParams.isbn_13 },
      });

      const associatedBook = await books[0].toJSON();

      assert.strictEqual(createdBook.id, associatedBook.id);
    });
  });

  describe('.removeBook', (): void => {
    before(async (): Promise<void> => {
      // Delete all the books added above
      await db.Book.destroy({ where: {} });

      // Make sure there are on books in the books table
      const books = db.Book.findAll({ where: {} });
      if (books.length){
        throw new Error('There should be no books in the database');
      }
    });

    it('should remove book from database', async (): Promise<void> => {
      const tddBook = await ReadingList.addBook(tddParams, defaultUser);

      await ReadingList.removeBook(book.id, defaultUser.id);
      const userBooks = await db.UserBook.findAll({
        where: {
          book_id: tddBook.id,
          user_id: defaultUser.id,
        },
      });

      assert.lengthOf(userBooks, 0);
    });
  });

  describe('.getList', (): void => {
    beforeEach(async (): Promise<void> => {
      // Delete all the books added above
      await db.UserBook.destroy({ where: {} });
      await ReadingList.addBook(tddParams, defaultUser);
    });

    it('should return reading list (array of Book)', async (): Promise<void> => {
      const userBooks: Book[] = await ReadingList.getList(defaultUser, 1);
      assert.lengthOf(userBooks, 1);

      // The book should have all the fields provided.
      // Remove the "authors" field because it's a bit more complicated to test,
      // and the AuthorBook relationship is already tested elsewhere.
      const tddParamsWithoutAuthors = Object.assign({}, tddParams);
      delete tddParamsWithoutAuthors.authors;

      assert.include(userBooks[0], tddParamsWithoutAuthors);
      assert.instanceOf(userBooks[0], Book);
    });

    it('should return newest additions to the reading list first', async (): Promise<void> => {
      await ReadingList.addBook(eloquentJSParams, defaultUser);

      const tddBooksInDB = await db.Book.findAll({where: {title: tddParams.title}});
      const tddBook = await tddBooksInDB[0].toJSON();

      await ReadingList.removeBook(tddBook.id, defaultUser.id);
      await ReadingList.addBook(tddParams, defaultUser);

      const userBooks = await ReadingList.getList(defaultUser, 1);

      assert.strictEqual(userBooks[0].title, tddParams.title);
      assert.strictEqual(userBooks[1].title, eloquentJSParams.title);
    });
  });

  describe('.getCount', (): void => {
    before(async (): Promise<void> => {
      // Delete all the books added above
      await db.UserBook.destroy({ where: {} });
      await ReadingList.addBook(tddParams, defaultUser);
      await ReadingList.addBook(eloquentJSParams, defaultUser);
    });

    it('should return reading list length', async (): Promise<void> => {
      const count = await ReadingList.getCount(defaultUser);
      assert.strictEqual(count, 2);
    });
  });
});
