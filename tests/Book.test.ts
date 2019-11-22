import { assert } from 'chai';
import Book from '../src/models/Book';

const params = {
  title: "The Food Lab: Better Home Cooking Through Science",
  publisher: "W. W. Norton & Company",
  authors: ["J. Kenji López-Alt"],
  isbn_10: "0393249867",
  isbn_13: "9780393249866",
  issn: null,
  other_identifier: null,
  random_param: "123",
}

const paramsGoogleFormat = {
  title: "The Food Lab: Better Home Cooking Through Science",
  publisher: "W. W. Norton & Company",
  authors: ["J. Kenji López-Alt"],
  industryIdentifiers: [
    { type: "ISBN_10", identifier: "0393249867" },
    { type: "ISBN_13", identifier: "9780393249866" },
    { type: "ISSN", identifier: "20493630," },
    { type: "OTHER", identifier: "COLUMBIA:11291994," },
  ],
}

describe('Book', (): void => {
  describe('new Book()', (): void => {
    it('should set appropriate properties', (): void => {
      const book = new Book(params);

      assert.strictEqual(book.title, params.title);
      assert.strictEqual(book.publisher, params.publisher);
      assert.sameMembers(book.authors, params.authors);
      assert.strictEqual(book.isbn_10, params.isbn_10);
      assert.strictEqual(book.isbn_13, params.isbn_13);
      assert.strictEqual(book.issn, params.issn);
      assert.strictEqual(book.other_identifier, params.other_identifier);
      assert.doesNotHaveAnyKeys(book, ['random_param']);
    });
  });

  describe('Book.create()', (): void => {
    it('should return a Book given params', (): void => {
      const book = Book.create(params);
      assert.instanceOf(book, Book);
    });

    it('should not return a Book if no title is passed in', (): void => {
      const paramsWithoutTitle = Object.assign({}, params, {
        title: null,
      });

      const book = Book.create(paramsWithoutTitle);
      assert.notInstanceOf(book, Book);
      assert.deepEqual(book, null);
    });

    it('should trim() title and publisher', (): void => {
      const paramsWithExtraSpace = Object.assign({}, params, {
        title: ` ${params.title}   `,
        publisher: ` ${params.publisher}`,
      });

      const book = Book.create(paramsWithExtraSpace);
      assert.strictEqual(book.title, params.title);
      assert.strictEqual(book.publisher, params.publisher);
    });

    it('should parse industryIdentifiers object to match books table in database', (): void => {
      const book = Book.create(paramsGoogleFormat);

      assert.strictEqual(book.isbn_10, paramsGoogleFormat.industryIdentifiers[0].identifier);
      assert.strictEqual(book.isbn_13, paramsGoogleFormat.industryIdentifiers[1].identifier);
      assert.strictEqual(book.issn, paramsGoogleFormat.industryIdentifiers[2].identifier);
      assert.strictEqual(book.other_identifier, paramsGoogleFormat.industryIdentifiers[3].identifier);
    });

    it('should skip identifier if identifier or type is missing', (): void => {
      const paramsMissing = Object.assign({}, params, {
        industryIdentifiers: [
          { type: "ISBN_10", identifier: "" },
          { type: "", identifier: "9780393249866" },
          { type: "ISSN", identifier: "20493630," },
          { type: "OTHER", identifier: "COLUMBIA:11291994," },
        ],
      });
      const book = Book.create(paramsMissing);

      assert.strictEqual(book.isbn_10, null);
      assert.strictEqual(book.isbn_13, null);
      assert.strictEqual(book.issn, paramsGoogleFormat.industryIdentifiers[2].identifier);
      assert.strictEqual(book.other_identifier, paramsGoogleFormat.industryIdentifiers[3].identifier);
    });
  });
});

