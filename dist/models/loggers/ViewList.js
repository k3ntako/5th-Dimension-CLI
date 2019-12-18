"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Third-party dependencies
const clear_1 = __importDefault(require("clear"));
const logging_1 = __importDefault(require("../../utilities/logging"));
exports.default = {
    viewList(tenBooksInList) {
        clear_1.default();
        if (tenBooksInList.length) {
            logging_1.default.readingListMessage();
            tenBooksInList.forEach(logging_1.default.logOneBook);
        }
        else {
            logging_1.default.noReadingListBooks();
        }
    }
};
