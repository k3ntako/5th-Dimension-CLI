import { assert } from 'chai';
import BookSearch from '../models/BookSearch';


describe('BookSearch', (): void => {
  describe('#search()', (): void => {
    it('should set BookSearch#searchStr to string passed in', () => {
      const searchTerm = 'Born a Crime';

      const bookSearch = new BookSearch();
      bookSearch.search(searchTerm);

      assert.strictEqual(bookSearch.searchStr, searchTerm);
    });

    it('should remove unnecessary spaces from search term', () => {
      const bookSearch = new BookSearch();
      bookSearch.search(' Born a  Crime ');

      assert.strictEqual(bookSearch.searchStr, 'Born a Crime');
    });
  });

  describe('#fetchBooks()', (): void => {
    let results;
    it('should fetch a books from Google Books based on BookSearch#searchStr', async (): Promise<void> => {
      const searchTerm = 'Born a Crime';

      const bookSearch = new BookSearch();
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
        assert.hasAllKeys(book.volumeInfo, ['title', 'authors', 'publisher'])
      });
    });
  });
});

