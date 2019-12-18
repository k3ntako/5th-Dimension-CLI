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
const inquirer_1 = require("inquirer");
// Local dependencies
const Action_1 = __importDefault(require("./Action"));
const BookSearch_1 = __importDefault(require("../BookSearch"));
const errorLogging_1 = require("../../utilities/errorLogging");
const Loading_1 = __importDefault(require("../Loading"));
const logging_1 = __importDefault(require("../../utilities/logging"));
class SearchAction extends Action_1.default {
    constructor() {
        super();
        this.fetchBooks = (searchStr) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.loading.start();
                const googleResults = yield BookSearch_1.default.search(searchStr);
                this.loading.stop();
                return googleResults;
            }
            catch (err) {
                this.loading.stop();
                errorLogging_1.error(err);
            }
        });
        this.loading = new Loading_1.default();
    }
    static start() {
        return __awaiter(this, void 0, void 0, function* () {
            const searchAction = new SearchAction();
            const searchStr = yield searchAction.promptSearchStr();
            const googleResults = yield searchAction.fetchBooks(searchStr);
            searchAction.logBooks(googleResults, searchStr);
            return { searchAction, googleResults };
        });
    }
    promptSearchStr() {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchStr } = yield inquirer_1.prompt({
                message: "Please enter your search term...",
                name: "searchStr",
                type: "input",
            });
            if (!searchStr || !searchStr.trim()) {
                clear_1.default();
                errorLogging_1.warn("No search term entered");
                return yield this.promptSearchStr();
            }
            return searchStr;
        });
    }
    logBooks(googleResults, searchStr) {
        if (!googleResults.length) {
            return logging_1.default.noSearchResults(searchStr);
        }
        logging_1.default.searchResultsMessage(searchStr);
        googleResults.forEach(this.logOneBook);
    }
}
exports.default = SearchAction;
