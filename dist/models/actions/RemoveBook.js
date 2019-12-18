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
const inquirer_1 = require("inquirer");
const emoji_1 = require("../../utilities/emoji");
const ReadingList_1 = __importDefault(require("../ReadingList"));
class RemoveBookAction {
    constructor() { }
    static start(books, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const removeBookAction = new RemoveBookAction();
            const promptChoices = removeBookAction.preparePromptChoices(books);
            const { bookIndices } = yield removeBookAction.promptBooksToRemove(promptChoices);
            return yield removeBookAction.removeBooks(books, bookIndices, user);
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
}
exports.default = RemoveBookAction;
