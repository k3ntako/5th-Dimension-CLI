import { assert } from 'chai';
import sinon from 'sinon';
import BookSearch from '../models/BookSearch';
import ReadingListManager from '../models/ReadingListManager';
import { IBook } from '../utilities/interfaces';


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

  describe('#promptSearch()', (): void => {
    it('should fetch a books from Google Books based on BookSearch#searchStr', async (): Promise<void> => {
      const bookName: string = "Born a Crime";
      const fakePrompt: sinon.SinonSpy<any> = sinon.fake.resolves({ search: bookName});
      sinon.replace(ReadingListManager, 'prompt', fakePrompt);

      const bookSearch: BookSearch = new BookSearch();
      await bookSearch.promptSearch();

      assert.strictEqual(fd2.fakes.consoleLogFake.callCount, 21);


      const arg0: string = fd2.fakes.consoleLogFake.getCall(0).lastArg;
      assert.include(arg0, `Search results: "${bookName}"`);
      const arg1: string = fd2.fakes.consoleLogFake.getCall(1).lastArg;
      assert.include(arg1, "Born a Crime");
      const arg2: string = fd2.fakes.consoleLogFake.getCall(2).lastArg;
      assert.include(arg2, "Author(s): ");
      const arg3: string = fd2.fakes.consoleLogFake.getCall(3).lastArg;
      assert.include(arg3, "Publisher: ");
    });
  });
});

