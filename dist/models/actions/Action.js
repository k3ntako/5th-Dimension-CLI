"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Third-party dependencies
const chalk_1 = __importDefault(require("chalk"));
// Local dependencies
const emoji_1 = require("../../utilities/emoji");
const logging_1 = __importDefault(require("../../utilities/logging"));
class Action {
    constructor() { }
    logOneBook(book, idx) {
        const emojiNum = Number.isInteger(idx) ? `${emoji_1.NUMBERS[idx + 1]}  ` : "";
        const authors = book.authors && book.authors.join(", ");
        logging_1.default.logOneBook(emojiNum, chalk_1.default.bold(book.title), authors, book.publisher);
    }
}
exports.default = Action;
