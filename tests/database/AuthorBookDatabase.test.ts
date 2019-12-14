import { assert } from 'chai';
import db from '../../src/sequelize/models';
import { Book as IBook } from '../../src/sequelize/models/book';
import { Author as IAuthor } from '../../src/sequelize/models/author';
import { AuthorBook as IAuthorBook } from '../../src/sequelize/models/author_book';

const title: string = "Tuesdays with Morrie";
const publisher: string = "Doubleday";
const authorName: string = "Mitch Albom";
const isbn_10 = '0307275639';
const isbn_13 = '9780307275639';
const issn = '17510112';
const other_identifier = 'OCLC:36130729';

describe('Database', (): void => {
  describe('Book', (): void => {
    it('should have fields for title (string) and publisher (string)', async (): Promise<void> => {
      const book: IBook = await db.Book.create({
        title,
        publisher,
        isbn_10,
        isbn_13,
        issn,
        other_identifier,
      });

      assert.strictEqual(book.title, title);
      assert.strictEqual(book.publisher, publisher);
      assert.strictEqual(book.isbn_10, isbn_10);
      assert.strictEqual(book.isbn_13, isbn_13);
      assert.strictEqual(book.issn, issn);
      assert.strictEqual(book.other_identifier, other_identifier);
    });
  });

  describe('Author', (): void => {
    it('should have a field for name (string)', async (): Promise<void> => {
      const author: IAuthor = await db.Author.create({ name: authorName });

      assert.strictEqual(author.name, authorName);
    });
  });

  describe('AuthorBook', (): void => {
    it('should have a field for author_id and book_id', async (): Promise<void> => {
      const author: IAuthor[] = await db.Author.findAll({
        where: { name: authorName }
      });
      const author_id: string = author[0].dataValues.id;

      const book: IBook[] = await db.Book.findAll({
        where: {
          title,
          publisher,
        }
      });
      const book_id: string = book[0].dataValues.id;

      const authorBook: IAuthorBook = await db.AuthorBook.create({
        author_id: author_id,
        book_id: book_id,
      });

      assert.strictEqual(authorBook.author_id, author_id);
      assert.strictEqual(authorBook.book_id, book_id);
    });

    it('should associate author and book in many to many relationship', async (): Promise<void> => {
      const author: IAuthor[] = await db.Author.findAll({
        where: { name: authorName }
      });

      const books: IBook[] = await author[0].getBooks();
      const newTitle = books[0].getDataValue('title');
      const newPublisher = books[0].getDataValue('publisher');

      assert.strictEqual(newTitle, title);
      assert.strictEqual(newPublisher, publisher);
    });
  });
});
