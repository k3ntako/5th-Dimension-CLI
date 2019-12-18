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
const clear_1 = __importDefault(require("clear"));
// Local dependencies
const Action_1 = __importDefault(require("./Action"));
const ReadingList_1 = __importDefault(require("../ReadingList"));
const logging_1 = __importDefault(require("../../utilities/logging"));
class ViewListAction extends Action_1.default {
    constructor() {
        super();
    }
    static start(user, readingListPage) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewListAction = new ViewListAction();
            clear_1.default();
            const tenBooksInList = yield ReadingList_1.default.getList(user, readingListPage);
            viewListAction.logBooks(tenBooksInList);
            return { viewListAction };
        });
    }
    logBooks(tenBooksInList) {
        if (tenBooksInList.length) {
            logging_1.default.readingListMessage();
            tenBooksInList.forEach(this.logOneBook);
        }
        else {
            logging_1.default.noReadingListBooks();
        }
    }
}
exports.default = ViewListAction;
