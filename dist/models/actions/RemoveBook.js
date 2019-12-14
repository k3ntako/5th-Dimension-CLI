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
// Third-party dependencies
const clear_1 = __importDefault(require("clear"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = require("inquirer");
// Local dependencies
const Action_1 = __importDefault(require("./Action"));
const emoji_1 = require("../../utilities/emoji");
const ReadingList_1 = __importDefault(require("../ReadingList"));
class RemoveBookAction extends Action_1.default {
    constructor() {
        super();
    }
    static start(books, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const removeBookAction = new RemoveBookAction();
            const promptChoices = removeBookAction.preparePromptChoices(books);
            const { bookIndices } = yield removeBookAction.promptBooksToRemove(promptChoices);
            clear_1.default();
            const booksRemoved = yield removeBookAction.removeBooks(books, bookIndices, user);
            yield removeBookAction.logBooks(booksRemoved);
            return { removeBookAction };
        });
    }
    preparePromptChoices(books) {
        return books.map((book, idx) => ({
            name: `${emoji_1.NUMBERS[idx + 1]}  ${book.title}`,
            value: idx,
        }));
    }
    promptBooksToRemove(promptChoices) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield inquirer_1.prompt({
                message: "Which book(s) would you like to remove from your reading list?",
                name: "bookIndices",
                choices: promptChoices,
                type: "checkbox",
            });
        });
    }
    removeBooks(books, bookIndices, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const booksToRemove = books.filter((_, idx) => bookIndices.includes(idx));
            const promises = booksToRemove.map(book => ReadingList_1.default.removeBook(book.id, user.id));
            yield Promise.all(promises);
            return booksToRemove;
        });
    }
    logBooks(booksToRemove) {
        const titles = booksToRemove.map(book => chalk_1.default.redBright(book.title)).join('\n');
        if (!booksToRemove.length) {
            return console.log('No books removed');
        }
        console.log(chalk_1.default.bold("Books removed:"));
        console.log(titles);
    }
}
exports.default = RemoveBookAction;
