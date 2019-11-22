import { assert } from 'chai';
import { Author, Book, AuthorBook } from '../src/sequelize/models';

const bookName: string = "Tuesdays with Morrie";
const bookPublisher: string = "Doubleday";
const authorName: string = "Mitch Albom";
const isbn_10 = '0307275639';
const isbn_13 = '9780307275639';
const other_identifier = 'OCLC:36130729';

describe('Database', (): void => {
  describe('Book', (): void => {
    it('should have fields for name (string) and publisher (string)', async (): Promise<void> => {
      const book: Book = await Book.create({
        name: bookName,
        publisher: bookPublisher,
        isbn_10,
        isbn_13,
        other_identifier,
      });

      assert.strictEqual(book.name, bookName);
      assert.strictEqual(book.publisher, bookPublisher);
      assert.strictEqual(book.isbn_10, isbn_10);
      assert.strictEqual(book.isbn_13, isbn_13);
      assert.strictEqual(book.other_identifier, other_identifier);
    });
  });

  describe('Author', (): void => {
    it('should have a field for name (string)', async (): Promise<void> => {
      const author: Author = await Author.create({ name: authorName });

      assert.strictEqual(author.name, authorName);
    });
  });

  describe('AuthorBook', (): void => {
    it('should have a field for author_id and book_id', async (): Promise<void> => {
      const author: Author[] = await Author.findAll({
        where: { name: authorName }
      });
      const author_id: string = author[0].dataValues.id;

      const book: Book[] = await Book.findAll({
        where: {
          name: bookName,
          publisher: bookPublisher,
        }
      });
      const book_id: string = book[0].dataValues.id;

      const authorBook: AuthorBook = await AuthorBook.create({
        author_id: author_id,
        book_id: book_id,
      });

      assert.strictEqual(authorBook.author_id, author_id);
      assert.strictEqual(authorBook.book_id, book_id);
    });

    it('should associate author and book in many to many relationship', async (): Promise<void> => {
      const author: Author[] = await Author.findAll({
        where: { name: authorName }
      });

      const books: Book[] = await author[0].getBooks();
      const book = await books[0].toJSON();

      assert.strictEqual(book.name, bookName);
      assert.strictEqual(book.publisher, bookPublisher);
    });
  });
});
