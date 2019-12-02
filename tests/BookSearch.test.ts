import { assert } from 'chai';
import BookSearch from '../src/models/BookSearch';
import Book from '../src/models/Book';
import sinon from 'sinon';

describe('BookSearch', (): void => {
  describe('#search()', (): void => {
    it('should should call BookSearch.fetchBooks with search term', async (): Promise < void> => {
      const searchTerm: string = 'Born a Crime';

      const bookFetchFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(BookSearch, 'fetchBooks', bookFetchFake);

      await BookSearch.search(searchTerm);

      const arg = bookFetchFake.getCall(0).lastArg;
      assert.strictEqual(bookFetchFake.callCount, 1);
      assert.strictEqual(arg, searchTerm);
    });

    it('should remove unnecessary spaces from search term', async (): Promise<void> => {
      const bookFetchFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(BookSearch, 'fetchBooks', bookFetchFake);

      await BookSearch.search(' Born a  Crime ');;

      const arg = bookFetchFake.getCall(0).lastArg;
      assert.strictEqual(bookFetchFake.callCount, 1);
      assert.strictEqual(arg, 'Born a Crime');
    });
  });

  describe('#fetchBooks()', (): void => {
    let results: Book[];
    it('should fetch a books from Google Books based on BookSearch#searchStr', async (): Promise<void> => {
      const searchTerm: string = 'Born a Crime';

      results = await BookSearch.search(searchTerm);

      assert.typeOf(results, 'array');
    });

    it('should fetch result should be no more than five items long', async (): Promise<void> => {
      assert.isAtMost(results.length, 5);
    });

    it('each item should have appropriate keys', (): void => {
      results.forEach(book => {
        assert.instanceOf(book, Book);
        assert.hasAllKeys(book, ['id', 'title', 'authors', 'publisher']);
        assert.doesNotHaveAnyKeys(book, ['industryIdentifiers', 'volumeInfo', 'items']);
      });
    });
  });
});

