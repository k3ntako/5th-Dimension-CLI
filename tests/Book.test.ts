import { assert } from 'chai';
import Book from '../src/models/Book';

const params = {
  id: "SKHUFIHS",
  title: "The Food Lab: Better Home Cooking Through Science",
  publisher: "W. W. Norton & Company",
  authors: ["J. Kenji López-Alt"],
  random_param: "123",
}

const paramsGoogleFormat = {
  title: "The Food Lab: Better Home Cooking Through Science",
  publisher: "W. W. Norton & Company",
  authors: ["J. Kenji López-Alt"],
}

describe('Book', (): void => {
  describe('new Book()', (): void => {
    it('should set appropriate properties', (): void => {
      const book = new Book(params);

      assert.strictEqual(book.id, params.id);
      assert.strictEqual(book.title, params.title);
      assert.strictEqual(book.publisher, params.publisher);
      assert.sameMembers(book.authors, params.authors);

      assert.doesNotHaveAnyKeys(book, ['random_param']);
    });
  });

  describe('Book.create()', (): void => {
    it('should return a Book given params', (): void => {
      const book = Book.create(params);
      assert.instanceOf(book, Book);
    });

    it('should not return a Book if no id is passed in', (): void => {
      const paramsWithoutId = Object.assign({}, params, {
        id: null,
      });

      const book = Book.create(paramsWithoutId);
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
  });
});

