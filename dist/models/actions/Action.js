"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Third-party dependencies
const chalk_1 = __importDefault(require("chalk"));
// Local dependencies
const emoji_1 = require("../../utilities/emoji");
class Action {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() { }
    logOneBook(book, idx) {
        const emojiNum = Number.isInteger(idx) ? `${emoji_1.NUMBERS[idx + 1]}  ` : "";
        const authors = book.authors && book.authors.join(", ");
        console.log(emojiNum + chalk_1.default.bold(book.title));
        console.log("Author(s): " + (authors || "N/A"));
        console.log("Publisher: " + (book.publisher || "N/A") + "\n");
    }
}
exports.default = Action;
