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
const chalk_1 = __importDefault(require("chalk"));
const clear_1 = __importDefault(require("clear"));
const inquirer_1 = require("inquirer");
// Local dependencies
const Action_1 = __importDefault(require("./Action"));
const ReadingList_1 = __importDefault(require("../ReadingList"));
const emoji_1 = require("../../utilities/emoji");
const logging_1 = __importDefault(require("../../utilities/logging"));
class AddBookAction extends Action_1.default {
    constructor() {
        super();
    }
    static start(googleResults, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const addBookAction = new AddBookAction();
            const promptChoices = addBookAction.preparePromptChoices(googleResults);
            const { bookIndices } = yield addBookAction.promptBooksToAdd(promptChoices);
            const booksAdded = yield addBookAction.addBooksToDB(googleResults, bookIndices, user);
            addBookAction.logBooks(booksAdded);
            return { addBookAction };
        });
    }
    preparePromptChoices(googleResults) {
        return googleResults.map((book, idx) => ({
            name: `${emoji_1.NUMBERS[idx + 1]}  ${book.title}`,
            value: idx,
        }));
    }
    promptBooksToAdd(promptChoices) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield inquirer_1.prompt({
                message: "Which book(s) would you like to add to your reading list?",
                name: "bookIndices",
                choices: promptChoices,
                type: "checkbox",
            });
        });
    }
    addBooksToDB(googleResults, bookIndices, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const booksToAdd = googleResults.filter((_, idx) => bookIndices.includes(idx));
            const promises = booksToAdd.map(book => ReadingList_1.default.addBook(book, user));
            yield Promise.all(promises);
            return booksToAdd;
        });
    }
    logBooks(bookAdded) {
        clear_1.default();
        if (!bookAdded.length) {
            return logging_1.default.noBooksAdded();
        }
        const titles = bookAdded.map(book => chalk_1.default.greenBright(book.title)).join('\n');
        logging_1.default.booksAdded(titles);
    }
}
exports.default = AddBookAction;
