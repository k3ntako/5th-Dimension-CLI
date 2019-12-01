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
require('dotenv').config();
const node_fetch_1 = __importDefault(require("node-fetch"));
const Book_1 = __importDefault(require("./Book"));
const chalk_1 = __importDefault(require("chalk"));
const node_emoji_1 = __importDefault(require("node-emoji"));
const warn = (message) => console.warn(`${node_emoji_1.default.get('warning')}  ${chalk_1.default.keyword('orange')(message)}`);
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS = "&fields=items(id,volumeInfo(title,authors,publisher,industryIdentifiers))";
const FIELDS_BY_ID = "&fields=id,volumeInfo(title,authors,publisher,industryIdentifiers)";
const LIMIT = '&maxResults=5';
class BookSearch {
    constructor() { }
    static search(searchStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const regex = /\s\s+/g; // remove multiple spaces in a row
            const parsedSearchStr = searchStr.trim().replace(regex, ' ');
            return yield BookSearch.fetchBooks(parsedSearchStr);
        });
    }
    static fetchBooks(searchStr) {
        return __awaiter(this, void 0, void 0, function* () {
            // Format searchStr into what Google expects
            const searchURL = searchStr
                .split(" ")
                .map(search => encodeURIComponent(search))
                .join("+");
            const url = BASE_URL + `?q=${searchURL}` + FIELDS + LIMIT + API_KEY;
            const response = yield node_fetch_1.default(url);
            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`);
            }
            const json = yield response.json();
            console.log(json);
            // no books returned
            if (!json.items) {
                return [];
            }
            const books = [];
            json.items.forEach(bookInfo => {
                const book = Book_1.default.create(bookInfo.volumeInfo);
                if (book)
                    books.push(book);
            });
            return books;
        });
    }
}
exports.default = BookSearch;
