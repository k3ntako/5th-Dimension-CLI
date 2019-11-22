import { assert } from 'chai';
import { Author, AuthorBook, Book, User, UserBook } from '../src/sequelize/models';

const firstName: string = "Kentaro";
const lastName: string = "Kaneki";
const email: string = "myEmail@example.com";

const title: string = "Test Driven Development: By Example";
const publisher: string = "Addison-Wesley Professional";
const authorName: string = "Kent Beck";

describe('Database', (): void => {
  before(async () => {
    await Book.create({
      title,
      publisher,
      authors: [{
        name: authorName,
      }]
    },{
      include: [{
        model: Author,
        through: AuthorBook,
        as: 'authors',
      }],
    });
  })

  describe('User', (): void => {
    it('should have fields for name (string) and publisher (string)', async (): Promise<void> => {
      const user: User = await User.create({
        first_name: firstName,
        last_name: lastName,
        email: email,
      });

      assert.strictEqual(user.first_name, firstName);
      assert.strictEqual(user.last_name, lastName);
      assert.strictEqual(email, email);
    });
  });

  describe('ReadingList', (): void => {
    it('should have a field for user_id and book_id', async (): Promise<void> => {
      const user: User[] = await User.findAll({
        where: { email }
      });
      const user_id: string = user[0].dataValues.id;

      const book: Book[] = await Book.findAll({
        where: {
          title,
          publisher,
        },
      });
      const book_id: string = book[0].dataValues.id;

      const userBook: UserBook = await UserBook.create({
        user_id: user_id,
        book_id: book_id,
      });

      assert.strictEqual(userBook.user_id, user_id);
      assert.strictEqual(userBook.book_id, book_id);
    });

    it('should associate book and user in many to many relationship', async (): Promise<void> => {
      const user: User[] = await User.findAll({
        where: { email }
      });

      const books: Book[] = await user[0].getBooks();
      const book = await books[0].toJSON();

      assert.strictEqual(book.title, title);
      assert.strictEqual(book.publisher, publisher);
    });
  });
});
