"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_emoji_1 = __importDefault(require("node-emoji"));
exports.default = {
    search: () => ({
        name: node_emoji_1.default.get('mag') + " Search for books!",
        value: "search",
    }),
    view_list: (listCount, bookPlurality) => ({
        name: node_emoji_1.default.get('books') + ` View your reading list (${listCount} book${bookPlurality})`,
        value: "view_list",
    }),
    remove_book: () => ({
        name: node_emoji_1.default.get('no_entry_sign') + ` Remove book(s) from your reading list`,
        value: "remove_book",
    }),
    add_book: () => ({
        name: node_emoji_1.default.get('star') + " Add book(s) above to your reading list",
        value: "add_book",
    }),
    next: () => ({
        name: node_emoji_1.default.get('arrow_forward') + "  Next page",
        value: "next",
    }),
    previous: () => ({
        name: node_emoji_1.default.get('arrow_backward') + "  Previous page",
        value: "previous",
    }),
    exit: () => ({
        name: node_emoji_1.default.get('closed_lock_with_key') + "  Exit",
        value: "exit",
    }),
};
