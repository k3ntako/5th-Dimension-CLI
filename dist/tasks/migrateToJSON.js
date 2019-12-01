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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ReadingList_1 = __importDefault(require("../models/ReadingList"));
const Loading_1 = __importDefault(require("../models/Loading"));
const models_1 = __importDefault(require("../sequelize/models"));
const User_1 = require("../models/User");
const node_fetch_1 = __importDefault(require("node-fetch"));
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS = "&fields=items(id,volumeInfo(title,authors,publisher))";
const LIMIT_ONE = '&maxResults=1';
const dataFileDir = path_1.default.join(__dirname, '../data/data.json');
const exportDBToJSON = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (fs_1.default.existsSync(dataFileDir)) {
            throw new Error('JSON file already exists.');
        }
        const loading = new Loading_1.default();
        loading.start();
        // Find the default user
        const email = User_1.DEFAULT_USER.email;
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
            successfulBooks.push({
                googleID: json.items[0].id,
                title: volumeInfo.title,
                authors: volumeInfo.authors,
                publisher: volumeInfo.publisher || null,
            });
        }
        ;
        yield ReadingList_1.default.exportToJSON(successfulBooks);
        loading.stop();
        if (failedBooks.length) {
            console.log('Following books were not added: ', failedBooks);
        }
        process.exit();
    }
    catch (err) {
        console.log(err.message);
    }
});
exportDBToJSON();
