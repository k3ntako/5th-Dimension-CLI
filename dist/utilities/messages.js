"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const clear_1 = __importDefault(require("clear"));
const errorLogging_1 = require("./errorLogging");
const emoji_1 = require("./emoji");
const APP_NAME = chalk_1.default.cyanBright.bold("5th Dimension CLI");
exports.default = {
    // General
    emptyLine: () => console.log(""),
    // Start and exit
    startMessage: () => {
        clear_1.default();
        console.log(`Welcome to ${APP_NAME}!`);
        console.log("It's place to discover new books and save them for later!");
    },
    exitMessage: () => {
        console.log(`Thank you for using ${APP_NAME}!`);
        console.log("Hope to see you soon!");
    },
    // Log one book
    logOneBook(book, idx) {
        const emojiNum = Number.isInteger(idx) ? `${emoji_1.NUMBERS[idx + 1]}  ` : "";
        const authors = book.authors && book.authors.join(", ");
        console.log(emojiNum + chalk_1.default.bold(book.title));
        console.log("Author(s): " + (authors || "N/A"));
        console.log("Publisher: " + (book.publisher || "N/A") + "\n");
    },
    // Adding books
    noBooksAdded: () => console.log('No books added'),
    booksAdded: (titles) => {
        console.log(chalk_1.default.bold("Book(s) added:"));
        console.log(titles);
    },
    // Removing books
    noBookRemoved: () => console.log('No books removed'),
    booksRemoved: (titles) => {
        console.log(chalk_1.default.bold("Book(s) removed:"));
        console.log(titles);
    },
    // Searching Google Books API
    searchResultsMessage: (searchStr) => console.log(`${chalk_1.default.bold("Search results for:")} "${searchStr}"\n`),
    noSearchResults: (searchStr) => errorLogging_1.warn(`No books found for: "${searchStr}"`),
    // View reading list
    readingListMessage: () => console.log(chalk_1.default.bold("Your Reading List:")),
    noReadingListBooks: () => console.log("There are no books in your reading list"),
};
