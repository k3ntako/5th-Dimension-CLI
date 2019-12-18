import db from '../sequelize/models';
import Book from './Book';
import { Book as IBook } from '../sequelize/models/book';
import { User as IUser } from '../sequelize/models/user';

interface TitleAndPublisher {
  title?: string;
  publisher?: string;
}

export default class ReadingList {
  searchStr: string;
  constructor() {}

  static async getCount(user): Promise<number>{
    return await user.countBooks();
  }

  static async findExistingBook(book: Book): Promise<IBook> {
    const { isbn_10, isbn_13, issn, other_identifier, title, publisher } = book;

    // Check if this book already exists in database
    // Prioritize ISBN, ISSN, Other Identifier, Title/Publisher/Author, in that order
    let where: {};
    if (isbn_10 || isbn_13) { // use ISBN to find book
      where = {
        [db.Sequelize.Op.or]: {
          isbn_10,
          isbn_13,
        }
      };
    } else if (issn) { // use ISSN to find book
      where = { issn };
    } else if (other_identifier) { // use ISSN to find book
      where = { other_identifier };
    } else { // use title and/or publisher to find book
      const and: TitleAndPublisher = {
        title
      };
      and.publisher = publisher || null;

      where = {
        [db.Sequelize.Op.and]: and,
      };
    }

    const books: IBook = await db.Book.findAll({ where });
    return books[0];
  }

  static async addBook(book: Book, user: IUser): Promise<Book>{
    try{
      let newBookDB: IBook = await this.findExistingBook(book);

      // If book does not exist in database, add it
      if (!newBookDB) {
        newBookDB = await ReadingList.addNewBook(book);
      }

      // make association (aka add to reading list in DB)
      await user.addBook(newBookDB);

      // turn newBookDB into Book instannce
      const newBook = await ReadingList.createBooksFromDB([ newBookDB ]);

      return newBook[0];
    } catch(err) {
      console.error(err);
    }
  }

  static async addNewBook(book: Book): Promise<IBook>{
    const { isbn_10, isbn_13, issn, other_identifier, title, publisher, authors } = book;
    const authorsAttributes = authors && authors.map(name => ({ name }));

    return await db.Book.create({
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

  static async removeBook(id: string, userId: string): Promise<number>{
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
    const books: IBook[] = await user.getBooks({
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

    return await ReadingList.createBooksFromDB(books);
  }

  static async createBooksFromDB(books: FD.DBBook[]): Promise<Book[]>{
    const bookPromises = books.map(book => book.toJSON());
    const bookJSONs: FD.DBBook[] = await Promise.all(bookPromises);

    return bookJSONs.map(book => Book.createFromDB(book));
  }
}