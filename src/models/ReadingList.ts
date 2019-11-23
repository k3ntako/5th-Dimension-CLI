import { Sequelize, Author, AuthorBook, Book as DBBook, User as DBUser } from '../sequelize/models';
import User from './User';
import Book from './Book';

interface ITitleAndPublisher {
  title?: string;
  publisher?: string;
}

export default class ReadingList {
  searchStr: string;
  constructor() {}

  static async addBook(book: Book, user: User){
    const userInDB = await DBUser.findByPk(user.id);

    const { isbn_10, isbn_13, issn, other_identifier, title, publisher, authors } = book;

    // Check if this book already exists in database
    // Prioritize ISBN, ISSN, Other Identifier, Title/Publisher/Author, in that order
    let where: {};
    if (isbn_10 || isbn_13) {
      where = {
        [Sequelize.Op.or]: {
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
        [Sequelize.Op.and]: and,
        // TODO: add author
      };
    }

    const books = await DBBook.findAll({ where });
    let newBook = books[0];

    if (newBook){
      userInDB.addBook(newBook);
    }else{
      const authorsAttributes = authors.map(name => ({ name }) );

      newBook = await DBBook.create({
        title,
        publisher,
        authors: authorsAttributes,
        isbn_10,
        isbn_13,
        issn,
        other_identifier,
      }, {
        include: [{
          model: Author,
          through: AuthorBook,
          as: 'authors',
        }],
      });
    }

    return newBook;
  }
}