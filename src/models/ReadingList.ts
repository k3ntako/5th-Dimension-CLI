import db from '../sequelize/models';
import Book from './Book';
import { Book as IBook } from '../sequelize/models/book';
import { User as IUser } from '../sequelize/models/user';

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

  static async getList(user: IUser, page: number): Promise<Book[]>{
    if (!page || page < 1){
      page = 1;
    }

    const offset = (page - 1) * 10;
    let books: IBook[] = await user.getBooks({
      include: [{
        model: db.sequelize.models.UserBook,
        as: 'userBooks',
      }, {
        model: db.sequelize.models.Author,
        as: 'authors',
        attributes: ['name'],
      }],
      order: [[ 'userBooks', 'created_at', 'DESC']],
      offset,
      limit: 10,
    });

    const bookPromises = books.map(book => book.toJSON());
    const bookJSON = await Promise.all(bookPromises);

    // Book#authors is an object because it is an association
    // below turns authors, an array of objects, to an array of author names (string)
    const parsedBookJSON = bookJSON.map(bookJSON => {
      bookJSON.authors = bookJSON.authors.map(author => author.name);
      return bookJSON;
    });

    return parsedBookJSON.map(book => new Book(book));
  }
}