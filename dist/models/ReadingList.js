"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __importDefault(require("../sequelize/models"));
const Book_1 = __importDefault(require("./Book"));
class ReadingList {
    constructor() { }
    static getCount(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user.countBooks();
        });
    }
    static addBook(book, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { isbn_10, isbn_13, issn, other_identifier, title, publisher, authors } = book;
                // Check if this book already exists in database
                // Prioritize ISBN, ISSN, Other Identifier, Title/Publisher/Author, in that order
                let where;
                if (isbn_10 || isbn_13) {
                    where = {
                        [models_1.default.Sequelize.Op.or]: {
                            isbn_10,
                            isbn_13,
                        }
                    };
                }
                else if (issn) {
                    where = {
                        issn,
                    };
                }
                else if (other_identifier) {
                    where = {
                        other_identifier,
                    };
                }
                else {
                    const and = {
                        title
                    };
                    and.publisher = publisher || null;
                    where = {
                        [models_1.default.Sequelize.Op.and]: and,
                    };
                }
                const books = yield models_1.default.Book.findAll({ where });
                let newBook = books[0];
                // If book does not exist in database, add it
                if (!newBook) {
                    const authorsAttributes = authors.map(name => ({ name }));
                    newBook = yield models_1.default.Book.create({
                        title,
                        publisher,
                        authors: authorsAttributes,
                        isbn_10,
                        isbn_13,
                        issn,
                        other_identifier,
                    }, {
                        include: [{
                                model: models_1.default.Author,
                                through: models_1.default.AuthorBook,
                                as: 'authors',
                            }],
                    });
                }
                // make association (aka add to reading list)
                yield user.addBook(newBook);
                return newBook;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    static removeBook(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield models_1.default.UserBook.destroy({
                where: {
                    book_id: id,
                    user_id: userId,
                },
            });
        });
    }
    static getList(user, page) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!page || page < 1) {
                page = 1;
            }
            const offset = (page - 1) * 10;
            const books = yield user.getBooks({
                include: [{
                        model: models_1.default.sequelize.models.UserBook,
                        as: 'userBooks',
                    }, {
                        model: models_1.default.sequelize.models.Author,
                        as: 'authors',
                        attributes: ['name'],
                    }],
                order: [['userBooks', 'created_at', 'DESC']],
                offset,
                limit: 10,
            });
            const bookPromises = books.map(book => book.toJSON());
            const bookJSON = yield Promise.all(bookPromises);
            // Book#authors is an object because it is an association
            // below turns authors, an array of objects, to an array of author names (string)
            const parsedBookJSON = bookJSON.map(bookJSON => {
                bookJSON.authors = bookJSON.authors.map(author => author.name);
                return bookJSON;
            });
            return parsedBookJSON.map(book => new Book_1.default(book));
        });
    }
}
exports.default = ReadingList;
