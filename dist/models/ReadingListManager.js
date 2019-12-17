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
const ReadingList_1 = __importDefault(require("./ReadingList"));
const inquirer_1 = __importStar(require("inquirer"));
const clear_1 = __importDefault(require("clear"));
const chalk_1 = __importDefault(require("chalk"));
const promptChoices_1 = __importDefault(require("../utilities/promptChoices"));
const actions_1 = __importDefault(require("./actions"));
const logging_1 = require("../utilities/logging");
const APP_NAME = chalk_1.default.cyanBright.bold("5th Dimension CLI");
const defaultChoices = [promptChoices_1.default.search()];
class ReadingListManager {
    constructor(user) {
        this.preparePromptChoices = (listCount) => {
            let promptChoicesToDisplay = defaultChoices.concat();
            // Add choices given on the prompt
            // if user has books in reading list, add view_list and remove_book as options
            if (listCount) {
                const bookPlurality = listCount === 1 ? "" : "s";
                promptChoicesToDisplay.push(promptChoices_1.default.view_list(listCount, bookPlurality));
                promptChoicesToDisplay.push(promptChoices_1.default.remove_book());
            }
            // if there are results from a Google Books search, add add_book as an option
            if (this.googleResults.length) {
                promptChoicesToDisplay.splice(2, 0, promptChoices_1.default.add_book());
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
        this.question = () => __awaiter(this, void 0, void 0, function* () {
            console.log(""); // for spacing
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
            const { action } = yield inquirer_1.prompt(promptOptions);
            yield this.performAction(action);
            setTimeout(this.question, 300); // Delay before prompting them again
        });
        if (!user || !user.id) {
            throw new Error("No user passed in");
        }
        this.user = user;
        this.googleResults = [];
        this.readingListPage = 0; // 0 means reading list not shown
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
    performAction(action) {
        return __awaiter(this, void 0, void 0, function* () {
            if (action !== "add_book") {
                clear_1.default();
            }
            // calls appropriate action based on input
            switch (action) {
                case "search":
                    const { googleResults } = yield actions_1.default.Search.start();
                    this.googleResults = googleResults;
                    break;
                case "view_list":
                    yield actions_1.default.ViewList.start(this.user, this.readingListPage);
                    break;
                case "add_book":
                    yield actions_1.default.AddBook.start(this.googleResults, this.user);
                    break;
                case "remove_book":
                    const tenBooksInList = yield ReadingList_1.default.getList(this.user, this.readingListPage);
                    yield actions_1.default.RemoveBook.start(tenBooksInList, this.user);
                    break;
                case "next":
                    this.readingListPage++;
                    yield actions_1.default.ViewList.start(this.user, this.readingListPage);
                    break;
                case "previous":
                    this.readingListPage--;
                    yield actions_1.default.ViewList.start(this.user, this.readingListPage);
                    break;
                case "exit":
                    ReadingListManager.exit();
                    break;
                default:
                    logging_1.warn('Command was not found: ' + action);
                    break;
            }
        });
    }
}
exports.default = ReadingListManager;
