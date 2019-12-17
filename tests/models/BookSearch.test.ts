import { assert } from 'chai';
import BookSearch from '../../src/models/BookSearch';
import Book from '../../src/models/Book';
import sinon from 'sinon';

describe('BookSearch', (): void => {
  describe('#start()', (): void => {
    let googleResults;

    it('should fetch a books from Google Books based on search term', async (): Promise<void> => {
      const searchTerm: string = 'Born a Crime';

      googleResults = await BookSearch.search(searchTerm);

      assert.typeOf(googleResults, 'array');
    }).timeout(8000);

    it('should fetch result should be no more than five items long', async (): Promise<void> => {
      assert.isAtMost(googleResults.length, 5);
    });

    it('each item should have appropriate keys', (): void => {
      googleResults.forEach(book => {
        assert.hasAllKeys(book, ['id', 'title', 'authors', 'publisher', 'isbn_10', 'isbn_13', 'issn', 'other_identifier']);
        assert.doesNotHaveAnyKeys(book, ['industryIdentifiers', 'volumeInfo', 'items']);
      });
    });
  });

  describe('#generateURL()', (): void => {
    it('should generate Google Books API url', async (): Promise<void> => {
      const bookFetchFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(BookSearch, 'fetchBooks', bookFetchFake);

      const url = BookSearch.generateURL(' Born a  Crime ');

      assert(url.startsWith('https://www.googleapis.com/books/v1/volumes'), 'URL should start with the base url');
      assert.include(url, "&fields=items(volumeInfo(title,authors,publisher,industryIdentifiers))", 'should specify the fields that will be returned');
      assert.include(url, "&maxResults=5", 'should specify a max of 5 books');
      assert.include(url, "&key=", 'should specify a API key');
    });

    it('should remove unnecessary spaces from search term', async (): Promise<void> => {
      const bookFetchFake: sinon.SinonSpy<any> = sinon.fake();
      sinon.replace(BookSearch, 'fetchBooks', bookFetchFake);

      const url = BookSearch.generateURL(' Born a  Crime ');

      assert.include(url, 'q=Born+a+Crime');
    });
  });
});
