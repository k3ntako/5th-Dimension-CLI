import fs from 'fs';
import path from 'path';
import Book from './Book';

const environment = process.env.NODE_ENV;
const config = require('../../config')[environment || "production"];
const dataFolderDir: string = config.dataFolderDir;
const dataFileDir: string = config.dataFileDir;
const dataFileName: string = config.dataFileName;



interface IBook {
  id: string;
  title?: string;
  authors: string[];
  publisher?: string;
}

export default class ReadingList {
  list: IBook[];
  constructor() {
    this.list = [];
  }

  static start(): ReadingList{
    const readingList: ReadingList = new ReadingList();
    readingList.list = ReadingList.importFromJSON();
    return readingList;
  }

  getCount = (): number => {
    return this.list.length;
  }

  addBook = (book: Book): void => {
    try{
      const { id, title, publisher, authors } = book;

      if (!id) {
        console.warn("This book does not have a valid ID and cannot be added to your list");
        return;
      }

      const exists = this.list.some(book => book.id === id);
      if (exists) {
        console.warn("This book is already in your reading list");
        return;
      }

      this.list.push({ id, title, publisher, authors });
    } catch(err) {
      console.error(err);
    }
  }

  removeBook = (id: string) => {
    this.list = this.list.filter(book => book.id !== id);
  }

  getList = (page: number = 1) => {
    const offset = (page - 1) * 10;
    return this.list.slice(offset, offset + 10);
  }

  saveToFile = (folderDir = dataFolderDir, fileName = dataFileName) => {
    ReadingList.exportToJSON(this.list, folderDir, fileName);
  }

  static exportToJSON(userBooks, folderDir = dataFolderDir, fileName = dataFileName){
    if (!Array.isArray(userBooks)) {
      throw new Error(`Expected userBooks to be an array but got ${typeof userBooks}`);
    }

    const userBookJSON = JSON.stringify(userBooks);

    // if folder does not exist, create it
    if (!fs.existsSync(folderDir)) {
      fs.mkdirSync(folderDir);
    }

    const fileDir = path.join(folderDir, fileName);
    fs.writeFileSync(fileDir, userBookJSON);
  }

  static importFromJSON (dir: string = dataFileDir, logging: Boolean = false ): IBook[] {
    try {
      if (!fs.existsSync(dir)) {
        logging && console.warn("Could not find file. Returning empty array");
        return [];
      }

      const userBooksStr = fs.readFileSync(dir, 'utf8');
      const userBooks = JSON.parse(userBooksStr);

      if (!Array.isArray(userBooks)){
        console.warn(`Expected userBooks to be an array but got ${typeof userBooks}`);
        console.warn('Returning an empty array...');
        return [];
      }

      return userBooks;
    } catch(err) {
      console.warn("Could not find file");
      return [];
    }
  }
}