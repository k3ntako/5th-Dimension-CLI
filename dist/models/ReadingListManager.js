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
const BookSearch_1 = __importDefault(require("./BookSearch"));
const ReadingList_1 = __importDefault(require("./ReadingList"));
const inquirer_1 = __importDefault(require("inquirer"));
const Loading_1 = __importDefault(require("./Loading"));
const clear_1 = __importDefault(require("clear"));
const node_emoji_1 = __importDefault(require("node-emoji"));
const chalk_1 = __importDefault(require("chalk"));
const warn = (message) => console.warn(`${node_emoji_1.default.get('warning')}  ${chalk_1.default.keyword('orange')(message)}`);
const error = (message) => console.error(`${node_emoji_1.default.get('warning')}  ${chalk_1.default.keyword('red')(message)}`);
const prompt = inquirer_1.default.createPromptModule();
const NUMBERS = [
    node_emoji_1.default.get('one'),
    node_emoji_1.default.get('two'),
    node_emoji_1.default.get('three'),
    node_emoji_1.default.get('four'),
    node_emoji_1.default.get('five'),
    node_emoji_1.default.get('six'),
    node_emoji_1.default.get('seven'),
    node_emoji_1.default.get('eight'),
    node_emoji_1.default.get('nine'),
    node_emoji_1.default.get('one') + " " + node_emoji_1.default.get('zero'),
];
const APP_NAME = chalk_1.default.cyanBright.bold("5th Dimension CLI");
const defaultChoices = [{
        name: node_emoji_1.default.get('mag') + " Search for books!",
        value: "search",
    }];
class ReadingListManager {
    constructor(user) {
        this.question = () => __awaiter(this, void 0, void 0, function* () {
            this.listCount = yield ReadingList_1.default.getCount(this.user);
            console.log("");
            let promptChoices = defaultChoices.concat();
            if (this.listCount) {
                const bookPlurality = this.listCount === 1 ? "" : "s";
                promptChoices.push({
                    name: node_emoji_1.default.get('books') + ` View your reading list (${this.listCount} book${bookPlurality})`,
                    value: "view_list",
                }, {
                    name: node_emoji_1.default.get('no_entry_sign') + ` Remove book(s) from your reading list`,
                    value: "remove_book",
                });
            }
            if (this.googleResults.length) {
                promptChoices.splice(2, 0, {
                    name: node_emoji_1.default.get('star') + " Add book(s) above to your reading list",
                    value: "add_book",
                });
            }
            const count = yield ReadingList_1.default.getCount(this.user);
            const hasNextPage = this.readingListPage && count > this.readingListPage * 10;
            const hasPreviousPage = this.readingListPage && this.readingListPage > 1;
            if (hasNextPage || hasPreviousPage) {
                promptChoices.push(new inquirer_1.default.Separator());
            }
            if (hasNextPage) {
                promptChoices.push({
                    name: node_emoji_1.default.get('arrow_forward') + "  Next page",
                    value: "next",
                });
            }
            if (hasPreviousPage) {
                promptChoices.push({
                    name: node_emoji_1.default.get('arrow_backward') + "  Previous page",
                    value: "previous",
                });
            }
            promptChoices.push(new inquirer_1.default.Separator(), {
                name: node_emoji_1.default.get('closed_lock_with_key') + "  Exit",
                value: "exit",
            }, new inquirer_1.default.Separator());
            const promptOptions = {
                message: "What would you like to do?",
                name: "action",
                choices: promptChoices,
                type: "list",
            };
            const { action } = yield ReadingListManager.prompt(promptOptions);
            switch (action) {
                case "search":
                    clear_1.default();
                    yield this.promptSearch();
                    break;
                case "view_list":
                    clear_1.default();
                    yield this.viewList();
                    break;
                case "add_book":
                    yield this.promptAddBook();
                    break;
                case "remove_book":
                    clear_1.default();
                    yield this.promptRemoveBook();
                    break;
                case "next":
                    clear_1.default();
                    this.readingListPage++;
                    yield this.viewList();
                    break;
                case "previous":
                    clear_1.default();
                    this.readingListPage--;
                    yield this.viewList();
                    break;
                case "exit":
                    clear_1.default();
                    yield ReadingListManager.exit();
                    break;
                default:
                    warn('Command was not found: ' + action);
                    break;
            }
            setTimeout(this.question, 300); // Delay before prompting them again
        });
        if (!user || !user.id) {
            throw new Error("No user passed in");
        }
        this.user = user;
        this.loading = new Loading_1.default();
        this.listCount = 0;
        this.googleResults = [];
        this.readingListPage = 0; // 0 means reading list not shown
    }
    static prompt(question) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prompt(question);
        });
    }
    start() {
        clear_1.default();
        console.log(`Welcome to ${APP_NAME}!`);
        console.log("It's place to discover new books and save them for later!");
        this.question();
    }
    static exit() {
        console.log(`Thank you for using ${APP_NAME}!`);
        console.log("Hope to see you soon!");
        process.exit();
    }
    static logBook(book, idx) {
        const emojiNum = Number.isInteger(idx) ? `${NUMBERS[idx]}  ` : "";
        const authors = book.authors && book.authors.join(", ");
        console.log(emojiNum + chalk_1.default.bold(book.title));
        console.log("Author(s): " + (authors || "N/A"));
        console.log("Publisher: " + (book.publisher || "N/A") + "\n");
    }
    promptSearch() {
        return __awaiter(this, void 0, void 0, function* () {
            this.readingListPage = null;
            const { search } = yield ReadingListManager.prompt({
                message: "Please enter your search term...",
                name: "search",
                type: "input",
            });
            if (!search || !search.trim()) {
                clear_1.default();
                warn("No search term entered");
                return yield this.promptSearch();
            }
            try {
                this.loading.start();
                this.googleResults = yield BookSearch_1.default.search(search);
                this.loading.stop();
            }
            catch (err) {
                this.loading.stop();
                error(err);
            }
            if (!this.googleResults.length) {
                warn(`No books found for: "${search}"`);
            }
            else {
                console.log(`${chalk_1.default.bold("Search results for:")} "${search}"\n`);
                this.googleResults.forEach(ReadingListManager.logBook);
            }
            this.readingListPage = null;
        });
    }
    promptAddBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const promptChoices = this.googleResults.map((book, idx) => ({
                name: `${NUMBERS[idx + 1]}  ${book.title}`,
                value: idx,
            }));
            const { bookIndices } = yield ReadingListManager.prompt({
                message: "Which book(s) would you like to add to your reading list?",
                name: "bookIndices",
                choices: promptChoices,
                type: "checkbox",
            });
            clear_1.default();
            if (!bookIndices.length) {
                return console.log('No books added');
            }
            const books = this.googleResults.filter((_, idx) => bookIndices.includes(idx));
            const titles = books.map(book => chalk_1.default.greenBright(book.title)).join('\n');
            const promises = books.map(book => ReadingList_1.default.addBook(book, this.user));
            yield Promise.all(promises);
            console.log(chalk_1.default.bold("Book(s) added:"));
            console.log(titles);
        });
    }
    promptRemoveBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const books = yield this.viewList();
            const promptChoices = books.map((book, idx) => ({
                name: `${NUMBERS[idx]}  ${book.title}`,
                value: idx,
            }));
            const { bookIndices } = yield ReadingListManager.prompt({
                message: "Which book(s) would you like to remove from your reading list?",
                name: "bookIndices",
                choices: promptChoices,
                type: "checkbox",
            });
            clear_1.default();
            if (!bookIndices.length) {
                return console.log('No books removed');
            }
            const booksToRemove = books.filter((_, idx) => bookIndices.includes(idx));
            const titles = booksToRemove.map(book => chalk_1.default.redBright(book.title)).join('\n');
            const promises = booksToRemove.map(book => ReadingList_1.default.removeBook(book.id, this.user.id));
            yield Promise.all(promises);
            console.log(chalk_1.default.bold("Books removed:"));
            console.log(titles);
        });
    }
    viewList() {
        return __awaiter(this, void 0, void 0, function* () {
            clear_1.default();
            if (this.readingListPage < 1) {
                this.readingListPage = 1;
            }
            const books = yield ReadingList_1.default.getList(this.user, this.readingListPage);
            if (books.length) {
                console.log(chalk_1.default.bold("Your Reading List:"));
                books.forEach(ReadingListManager.logBook);
                return books;
            }
            else {
                console.log("There are no books in your reading list");
            }
            return [];
        });
    }
}
exports.default = ReadingListManager;
