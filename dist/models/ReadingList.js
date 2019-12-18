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
    static findExistingBook(book) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isbn_10, isbn_13, issn, other_identifier, title, publisher } = book;
            // Check if this book already exists in database
            // Prioritize ISBN, ISSN, Other Identifier, Title/Publisher/Author, in that order
            let where;
            if (isbn_10 || isbn_13) { // use ISBN to find book
                where = {
                    [models_1.default.Sequelize.Op.or]: {
                        isbn_10,
                        isbn_13,
                    }
                };
            }
            else if (issn) { // use ISSN to find book
                where = { issn };
            }
            else if (other_identifier) { // use ISSN to find book
                where = { other_identifier };
            }
            else { // use title and/or publisher to find book
                const and = {
                    title
                };
                and.publisher = publisher || null;
                where = {
                    [models_1.default.Sequelize.Op.and]: and,
                };
            }
            const books = yield models_1.default.Book.findAll({ where });
            return books[0];
        });
    }
    static addBook(book, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let newBookDB = yield this.findExistingBook(book);
                // If book does not exist in database, add it
                if (!newBookDB) {
                    newBookDB = yield ReadingList.addNewBook(book);
                }
                // make association (aka add to reading list in DB)
                yield user.addBook(newBookDB);
                // turn newBookDB into Book instannce
                const newBook = yield ReadingList.createBooksFromDB([newBookDB]);
                return newBook[0];
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    static addNewBook(book) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isbn_10, isbn_13, issn, other_identifier, title, publisher, authors } = book;
            const authorsAttributes = authors && authors.map(name => ({ name }));
            return yield models_1.default.Book.create({
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
            return yield ReadingList.createBooksFromDB(books);
        });
    }
    static createBooksFromDB(books) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookPromises = books.map(book => book.toJSON());
            const bookJSONs = yield Promise.all(bookPromises);
            return bookJSONs.map(book => Book_1.default.createFromDB(book));
        });
    }
}
exports.default = ReadingList;
