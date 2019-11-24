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
                    let and = {
                        title
                    };
                    and.publisher = publisher || null;
                    where = {
                        [models_1.default.Sequelize.Op.and]: and,
                    };
                }
                const books = yield models_1.default.Book.findAll({ where });
                let newBook = books[0];
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
    static getList(user, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const offset = (page - 1) * 10;
            let books = yield user.getBooks({
                include: [{
                        model: models_1.default.sequelize.models.UserBook,
                        as: 'userBooks',
                    }],
                order: [['userBooks', 'created_at', 'DESC']],
                limit: 10,
                offset,
            });
            return books;
        });
    }
}
exports.default = ReadingList;
