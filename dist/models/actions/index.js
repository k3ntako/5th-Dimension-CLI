"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Local dependencies
const AddBook_1 = __importDefault(require("./AddBook"));
const RemoveBook_1 = __importDefault(require("./RemoveBook"));
const Search_1 = __importDefault(require("./Search"));
const ViewList_1 = __importDefault(require("./ViewList"));
exports.default = {
    AddBook: AddBook_1.default,
    RemoveBook: RemoveBook_1.default,
    Search: Search_1.default,
    ViewList: ViewList_1.default,
};
