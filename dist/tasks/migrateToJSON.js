"use strict";
// This file is used for migrating from Postgres to JSON
// This will take all the books with ISBN and gets the Google ID for them
// Then the book info (Google ID, title, authors, and publishers) is saved to JSON
// The newly created JSON file will act as the reading list moving forward
// This will make a request to Google Books API for every book with an ISBN
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
const fs_1 = __importDefault(require("fs"));
const ReadingList_1 = __importDefault(require("../models/ReadingList"));
const Loading_1 = __importDefault(require("../models/Loading"));
const models_1 = __importDefault(require("../sequelize/models"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const environment = process.env.NODE_ENV;
const config = require('../../config')[environment || "production"];
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS = "&fields=items(id,volumeInfo(title,authors,publisher))";
const LIMIT_ONE = '&maxResults=1';
module.exports.migrateToJSON = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let existingBooks = [], existingBookIDs = [];
        if (fs_1.default.existsSync(config.dataFileDir)) {
            existingBooks = ReadingList_1.default.importFromJSON(config.dataFileDir);
            existingBookIDs = existingBooks.map(book => book.id);
        }
        const loading = new Loading_1.default();
        loading.start();
        // Find the default user
        const email = "default@example.com";
        const users = yield models_1.default.User.findAll({
            where: { email }
        });
        if (!users.length) {
            throw new Error('No user with the ID found');
        }
        // Find all the books
        const user = users[0];
        const userBooks = yield user.getBooks({
            attributes: [
                'id', 'title', 'publisher', 'isbn_10', 'isbn_13', 'issn', 'other_identifier'
            ],
            include: [{
                    model: models_1.default.Author,
                    as: 'authors',
                }, {
                    model: models_1.default.UserBook,
                    as: 'UserBook',
                }],
        });
        const failedBooks = [];
        const successfulBooks = [];
        for (let userBook of userBooks) {
            const { title, publisher, authors, isbn_10, isbn_13, issn, other_identifier } = userBook.dataValues;
            const authorsArr = authors.map(author => author.name);
            const bookFromDB = {
                title,
                publisher,
                authors: authorsArr,
                isbn_10,
                isbn_13,
                issn,
                other_identifier,
            };
            if (!isbn_13 && !isbn_10) {
                failedBooks.push(bookFromDB);
                continue;
            }
            const url = BASE_URL + `?q=isbn:${isbn_13 || isbn_10}` + API_KEY + FIELDS + LIMIT_ONE;
            const response = yield node_fetch_1.default(url);
            if (!response.ok) {
                failedBooks.push(bookFromDB);
                continue;
            }
            const json = yield response.json();
            if (!json.items[0].id) {
                failedBooks.push(bookFromDB);
                continue;
            }
            const volumeInfo = json.items[0].volumeInfo;
            if (!existingBookIDs.includes(json.items[0].id)) {
                successfulBooks.push({
                    id: json.items[0].id,
                    title: volumeInfo.title,
                    authors: volumeInfo.authors,
                    publisher: volumeInfo.publisher || null,
                });
            }
        }
        ;
        ReadingList_1.default.exportToJSON(existingBooks.concat(successfulBooks));
        loading.stop();
        if (successfulBooks.length > 0) {
            console.log(`${successfulBooks.length} book(s) transferred!`);
        }
        else {
            console.log("No books transferred");
        }
        if (failedBooks.length) {
            console.log('Following books were not added: ', failedBooks);
        }
        process.exit();
    }
    catch (err) {
        console.error(err.message);
    }
});
