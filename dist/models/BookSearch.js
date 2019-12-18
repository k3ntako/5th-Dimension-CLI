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
/* global fetch */ // ESLint - fetch is available globally
const Book_1 = __importDefault(require("./Book"));
require('dotenv').config();
const doubleSpaceRegex = /\s\s+/g; // remove multiple spaces in a row
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS = "&fields=items(volumeInfo(title,authors,publisher,industryIdentifiers))";
const LIMIT = '&maxResults=5';
class BookSearch {
    constructor() {
    }
    static search(searchStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = BookSearch.generateURL(searchStr);
            const googleResultsRaw = yield BookSearch.fetchBooks(url);
            return this.parseGoogleResults(googleResultsRaw);
        });
    }
    static fetchBooks(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`);
            }
            return yield response.json();
        });
    }
}
exports.default = BookSearch;
BookSearch.generateURL = (searchStr) => {
    const parsedSearchStr = searchStr.trim().replace(doubleSpaceRegex, ' ');
    // Format searchStr into what Google expects
    const searchURL = parsedSearchStr
        .split(" ")
        .map(search => encodeURIComponent(search))
        .join("+");
    return BASE_URL + `?q=${searchURL}` + FIELDS + LIMIT + API_KEY;
};
BookSearch.parseGoogleResults = (googleResultsRaw) => {
    // no books returned
    if (!googleResultsRaw.items) {
        return [];
    }
    const books = [];
    googleResultsRaw.items.forEach(bookInfo => {
        const book = Book_1.default.createFromGoogle(bookInfo.volumeInfo);
        if (book)
            books.push(book);
    });
    return books;
};
