"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Third-party dependencies
const clear_1 = __importDefault(require("clear"));
const chalk_1 = __importDefault(require("chalk"));
const messages_1 = __importDefault(require("../../utilities/messages"));
exports.default = {
    addBook(bookAdded) {
        clear_1.default();
        if (!bookAdded.length) {
            return messages_1.default.noBooksAdded();
        }
        const titles = bookAdded.map(book => chalk_1.default.greenBright(book.title)).join('\n');
        messages_1.default.booksAdded(titles);
    },
    removeBook(booksToRemove) {
        clear_1.default();
        const titles = booksToRemove.map(book => chalk_1.default.redBright(book.title)).join('\n');
        if (!booksToRemove.length) {
            return messages_1.default.noBookRemoved();
        }
        messages_1.default.booksRemoved(titles);
    },
    search(googleResults, searchStr) {
        if (!googleResults.length) {
            return messages_1.default.noSearchResults(searchStr);
        }
        messages_1.default.searchResultsMessage(searchStr);
        googleResults.forEach(messages_1.default.logOneBook);
    },
    viewList(tenBooksInList) {
        clear_1.default();
        if (tenBooksInList.length) {
            messages_1.default.readingListMessage();
            tenBooksInList.forEach(messages_1.default.logOneBook);
        }
        else {
            messages_1.default.noReadingListBooks();
        }
    }
};
