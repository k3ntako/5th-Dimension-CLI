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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-case-declarations */
const ReadingList_1 = __importDefault(require("./ReadingList"));
const inquirer_1 = __importStar(require("inquirer"));
const promptChoices_1 = __importDefault(require("../utilities/promptChoices"));
const actions_1 = __importDefault(require("./actions"));
const loggers_1 = __importDefault(require("./loggers"));
const messages_1 = __importDefault(require("../utilities/messages"));
const errorLogging_1 = require("../utilities/errorLogging");
const defaultChoices = [promptChoices_1.default.search()];
class ReadingListManager {
    constructor(user) {
        this.preparePromptChoices = (listCount) => {
            const promptChoicesToDisplay = defaultChoices.concat();
            // Add choices given on the prompt
            // if user has books in reading list, add viewList and removeBook as options
            if (listCount) {
                const bookPlurality = listCount === 1 ? "" : "s";
                promptChoicesToDisplay.push(promptChoices_1.default.viewList(listCount, bookPlurality));
                promptChoicesToDisplay.push(promptChoices_1.default.removeBook());
            }
            // if there are results from a Google Books search, add addBook as an option
            if (this.googleResults.length) {
                promptChoicesToDisplay.splice(2, 0, promptChoices_1.default.addBook());
            }
            // add next page and previous page as options if appropriate
            const hasNextPage = this.readingListPage && listCount > this.readingListPage * 10;
            const hasPreviousPage = this.readingListPage && this.readingListPage > 1;
            if (hasNextPage || hasPreviousPage) {
                promptChoicesToDisplay.push(new inquirer_1.default.Separator());
            }
            if (hasNextPage) {
                promptChoicesToDisplay.push(promptChoices_1.default.next());
            }
            if (hasPreviousPage) {
                promptChoicesToDisplay.push(promptChoices_1.default.previous());
            }
            // add exit as an option
            promptChoicesToDisplay.push(new inquirer_1.default.Separator(), promptChoices_1.default.exit(), new inquirer_1.default.Separator());
            return promptChoicesToDisplay;
        };
        this.promptNextAction = () => __awaiter(this, void 0, void 0, function* () {
            messages_1.default.emptyLine(); // for spacing
            const listCount = yield ReadingList_1.default.getCount(this.user);
            const promptChoicesToDisplay = this.preparePromptChoices(listCount);
            // Prompt options
            const promptOptions = {
                message: "What would you like to do?",
                name: "action",
                choices: promptChoicesToDisplay,
                type: "list",
            };
            // prompt
            const { action } = yield this.prompt(promptOptions);
            yield this.performAction(action);
            setTimeout(this.promptNextAction, 300); // Delay before prompting them again
        });
        if (!user || !user.id) {
            throw new Error("No user passed in");
        }
        this.actions = {};
        for (const action in actions_1.default) {
            this.actions[action] = new actions_1.default[action]();
        }
        this.user = user;
        this.googleResults = [];
        this.readingListPage = 0; // 0 means reading list not shown
    }
    start() {
        messages_1.default.startMessage();
        this.promptNextAction();
    }
    static exit() {
        messages_1.default.exitMessage();
        process.exit();
    }
    prompt(promptOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield inquirer_1.prompt(promptOptions);
        });
    }
    search() {
        return __awaiter(this, void 0, void 0, function* () {
            const { googleResults, searchStr } = yield actions_1.default.Search.start();
            this.googleResults = googleResults;
            loggers_1.default.search(googleResults, searchStr);
        });
    }
    viewList() {
        return __awaiter(this, void 0, void 0, function* () {
            const tenBooksInList = yield ReadingList_1.default.getList(this.user, this.readingListPage);
            loggers_1.default.viewList(tenBooksInList);
        });
    }
    addBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const booksAdded = yield actions_1.default.AddBook.start(this.googleResults, this.user);
            loggers_1.default.addBook(booksAdded);
        });
    }
    removeBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const tenBooksInList = yield ReadingList_1.default.getList(this.user, this.readingListPage);
            const removedBooks = yield actions_1.default.RemoveBook.start(tenBooksInList, this.user);
            loggers_1.default.removeBook(removedBooks);
        });
    }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            this.readingListPage++;
            const tenBooksInList = yield ReadingList_1.default.getList(this.user, this.readingListPage);
            yield loggers_1.default.viewList(tenBooksInList);
        });
    }
    previous() {
        return __awaiter(this, void 0, void 0, function* () {
            this.readingListPage--;
            const tenBooksInList = yield ReadingList_1.default.getList(this.user, this.readingListPage);
            yield loggers_1.default.viewList(tenBooksInList);
        });
    }
    exit() {
        ReadingListManager.exit();
    }
    performAction(action) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this[action]();
            }
            catch (error) {
                errorLogging_1.warn(error.message);
            }
        });
    }
}
exports.default = ReadingListManager;
