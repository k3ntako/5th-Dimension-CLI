import { assert } from 'chai';
import ReadingList from '../src/models/ReadingList';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';

const dataFolderDir: string = path.join(__dirname, '/data');
const dataFileName: string = '/test_data.json';
const dataFileDir = path.join(dataFolderDir, dataFileName);

const params = {
  id: "TASKSCJSD",
  title: "Test-driven Development",
  publisher: "Addison-Wesley Professional",
  authors: ["Kent Beck"],
}

const params2 = {
  id: "UISNCSSL",
  title: "Eloquent JavaScript",
  publisher: "No Starch Press",
  authors: ["Marijn Haverbeke"],
}

describe('ReadingList', (): void => {
  describe('.start', (): void => {
    it('should return a new instance of ReadingList', (): void => {
      const readingList = new ReadingList();
      assert.instanceOf(readingList, ReadingList);
    });

    it('should import readingList from JSON', (): void => {
      const importFromJSONFake: sinon.SinonSpy<any> = sinon.fake.returns([params]);
      sinon.replace(ReadingList, 'importFromJSON', importFromJSONFake);

      const readingList = ReadingList.start();
      sinon.assert.calledOnce(importFromJSONFake);
      assert.lengthOf(readingList.list, 1);
      assert.deepEqual(readingList.list[0], params);
    });
  });


  describe('#addBook', (): void => {
    it('should add a book to list', (): void => {
      const readingList = new ReadingList();
      readingList.addBook(params);

      assert.lengthOf(readingList.list, 1);
      assert.deepEqual(readingList.list[0], params);
    });
  });

  describe('#saveToFile', (): void => {
    it('should save file with contents in list', (): void => {
      const readingList = new ReadingList();
      readingList.addBook(params);
      readingList.saveToFile(dataFolderDir, dataFileName);

      const booksStr: string = fs.readFileSync(dataFileDir, 'utf8');
      const books = JSON.parse(booksStr);

      assert.lengthOf(books, 1);
      assert.deepEqual(books[0], params);
    });

    it('should not add books with the same Google ID twice', (): void => {
      const readingList = new ReadingList();

      assert.lengthOf(readingList.list, 0);

      readingList.addBook(params);
      assert.lengthOf(readingList.list, 1);

      readingList.addBook(params);
      assert.lengthOf(readingList.list, 1)
    });
  });

  describe('#removeBook', (): void => {
    it('should remove book from database', (): void => {
      const readingList = new ReadingList();
      readingList.addBook(params);
      readingList.removeBook(params.id);

      assert.lengthOf(readingList.list, 0);
    });
  });

  describe('#getList', (): void => {
    it('should return reading list in ordered added (oldest first)',  (): void => {
      const readingList = new ReadingList();
      readingList.addBook(params);
      readingList.addBook(params2);

      const books = readingList.getList();

      assert.lengthOf(books, 2);

      assert.deepEqual(books[0], params);
      assert.deepEqual(books[1], params2);
    });
  });

  describe('#getCount', (): void => {
    it('should return reading list length',  (): void => {
      const readingList = new ReadingList();
      readingList.addBook(params);
      readingList.addBook(params2);

      const count = readingList.getCount();
      assert.strictEqual(count, 2);
    });
  });

  describe('.exportToJSON', (): void => {
    it('should write JSON to file',  (): void => {
      const readingList = new ReadingList();
      readingList.addBook(params);
      readingList.addBook(params2);

      ReadingList.exportToJSON(readingList.list, dataFolderDir, dataFileName);

      const booksStr = fs.readFileSync(dataFileDir, 'utf8');
      const books = JSON.parse(booksStr);

      assert.lengthOf(books, 2);
      assert.deepInclude(books[0], params);
      assert.deepInclude(books[1], params2);
    });
  });

  describe('.importFromJSON', (): void => {
    it('should read from JSON file', (): void => {
      const readingList = new ReadingList();
      readingList.addBook(params);
      readingList.addBook(params2);

      ReadingList.exportToJSON(readingList.list, dataFolderDir, dataFileName);
      const books = ReadingList.importFromJSON(dataFileDir);

      assert.lengthOf(books, 2);
      assert.deepInclude(books[0], params);
      assert.deepInclude(books[1], params2);
    });
  });
});
