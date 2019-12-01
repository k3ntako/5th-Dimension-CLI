import fs from 'fs';
import path from 'path';
import db from '../sequelize/models';
import Book from './Book';
import { Book as IBook } from '../sequelize/models/book';
import { User as IUser } from '../sequelize/models/user';

const dataFolderDir: string = path.join(__dirname, '../data');
const dataFileDir: string = path.join(dataFolderDir, '/data.json');


interface ITitleAndPublisher {
  title?: string;
  publisher?: string;
}

export default class ReadingList {
  searchStr: string;
  constructor() {}

  static async getCount(user){
    return await user.countBooks();
  }

  static async addBook(book: Book, user: IUser){
    try{
      const { isbn_10, isbn_13, issn, other_identifier, title, publisher, authors } = book;

      // Check if this book already exists in database
      // Prioritize ISBN, ISSN, Other Identifier, Title/Publisher/Author, in that order
      let where: {};
      if (isbn_10 || isbn_13) {
        where = {
          [db.Sequelize.Op.or]: {
            isbn_10,
            isbn_13,
          }
        };
      } else if (issn) {
        where = {
          issn,
        };
      } else if (other_identifier) {
        where = {
          other_identifier,
        };
      } else {
        let and: ITitleAndPublisher = {
          title
        };
        and.publisher = publisher || null;

        where = {
          [db.Sequelize.Op.and]: and,
          // TODO: add author
        };
      }

      const books = await db.Book.findAll({ where });
      let newBook = books[0];

      // If book does not exist in database, add it
      if (!newBook) {
        const authorsAttributes = authors.map(name => ({ name }));

        newBook = await db.Book.create({
          title,
          publisher,
          authors: authorsAttributes,
          isbn_10,
          isbn_13,
          issn,
          other_identifier,
        }, {
          include: [{
            model: db.Author,
            through: db.AuthorBook,
            as: 'authors',
          }],
        });
      }

      // make association (aka add to reading list)
      await user.addBook(newBook);

      return newBook;
    } catch(err) {
      console.error(err);
    }
  }

  static async removeBook(id: string, userId: string){
    return await db.UserBook.destroy({
      where: {
        book_id: id,
        user_id: userId,
      },
    });
  }

  static async getList(user: IUser, page: number){
    const offset = (page - 1) * 10;
    let books: IBook[] = await user.getBooks({
      include: [{
        model: db.sequelize.models.UserBook,
        as: 'userBooks',
      }],
      order: [[ 'userBooks', 'created_at', 'DESC']],
      offset,
      limit: 10,
    });
    return books;
  }

  static async exportToJSON(userBooks, folderDir = dataFolderDir, fileName = '/data.json'){
    const userBookJSON = JSON.stringify(userBooks);

    // if folder does not exist, create it
    if (!fs.existsSync(folderDir)) {
      fs.mkdirSync(folderDir);
    }

    const fileDir = path.join(folderDir, fileName);
    fs.writeFileSync(fileDir, userBookJSON);
  }

  static async importFromJSON(user, dir = dataFileDir) {
    try {
      const userBooksStr = fs.readFileSync(dataFileDir, 'utf8');
      const userBooks = JSON.parse(userBooksStr);

      if (!Array.isArray(userBooks)){
        throw new Error(`Expected file to be an array but got ${typeof userBooks}`);
      }

      return userBooks;
    } catch(err) {
      console.log("Cannot find file");
    }
  }
}