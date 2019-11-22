import { assert } from 'chai';
import sinon from 'sinon';
import BookSearch from '../src/models/BookSearch';
import ReadingListManager from '../src/models/ReadingListManager';
import { IBook } from '../src/utilities/interfaces';


describe('BookSearch', (): void => {
  describe('#search()', (): void => {
    it('should set BookSearch#searchStr to string passed in', (): void => {
      const searchTerm: string = 'Born a Crime';

      const bookSearch: BookSearch = new BookSearch();
      bookSearch.search(searchTerm);

      assert.strictEqual(bookSearch.searchStr, searchTerm);
    });

    it('should remove unnecessary spaces from search term', () => {
      const bookSearch: BookSearch = new BookSearch();
      bookSearch.search(' Born a  Crime ');

      assert.strictEqual(bookSearch.searchStr, 'Born a Crime');
    });
  });

  describe('#fetchBooks()', (): void => {
    let results: IBook[];
    it('should fetch a books from Google Books based on BookSearch#searchStr', async (): Promise<void> => {
      const searchTerm: string = 'Born a Crime';

      const bookSearch: BookSearch = new BookSearch();
      bookSearch.search(searchTerm);

      await bookSearch.fetchBooks();
      results = bookSearch.results;

      assert.typeOf(results, 'array');
    });

    it('should fetch result should be no more than five items long', async (): Promise<void> => {
      assert.isAtMost(results.length, 5);
    });

    it('each item should have appropriate keys', (): void => {
      results.forEach(book => {
        assert.hasAllKeys(book, ['title', 'authors', 'publisher', 'industryIdentifiers'])
      });
    });
  });
});

