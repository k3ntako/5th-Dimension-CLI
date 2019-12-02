"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logging_1 = require("../utilities/logging");
const environment = process.env.NODE_ENV;
const config = require('../../config')[environment || "production"];
const dataFolderDir = config.dataFolderDir;
const dataFileDir = config.dataFileDir;
const dataFileName = config.dataFileName;
class ReadingList {
    constructor() {
        this.getCount = () => {
            return this.list.length;
        };
        this.addBook = (book) => {
            try {
                const { id, title, publisher, authors } = book;
                if (!id) {
                    logging_1.warn(`This book (${title}) does not have a valid ID and cannot be added to your list`);
                    return false;
                }
                const exists = this.list.some(bookInList => bookInList.id === id);
                if (exists) {
                    logging_1.warn("This book is already in your reading list");
                    return false;
                }
                this.list.push({ id, title, publisher, authors });
                return true;
            }
            catch (err) {
                logging_1.error(err);
            }
        };
        this.removeBook = (id) => {
            this.list = this.list.filter(book => book.id !== id);
        };
        this.getList = (page = 1) => {
            const offset = (page - 1) * 10;
            return this.list.slice(offset, offset + 10);
        };
        this.saveToFile = (folderDir = dataFolderDir, fileName = dataFileName) => {
            ReadingList.exportToJSON(this.list, folderDir, fileName);
        };
        this.list = [];
    }
    static start() {
        const readingList = new ReadingList();
        readingList.list = ReadingList.importFromJSON();
        return readingList;
    }
    static exportToJSON(userBooks, folderDir = dataFolderDir, fileName = dataFileName) {
        if (!Array.isArray(userBooks)) {
            throw new Error(`Expected userBooks to be an array but got ${typeof userBooks}`);
        }
        const userBookJSON = JSON.stringify(userBooks);
        // if folder does not exist, create it
        if (!fs_1.default.existsSync(folderDir)) {
            fs_1.default.mkdirSync(folderDir);
        }
        const fileDir = path_1.default.join(folderDir, fileName);
        fs_1.default.writeFileSync(fileDir, userBookJSON);
    }
    static importFromJSON(dir = dataFileDir, logging = false) {
        try {
            if (!fs_1.default.existsSync(dir)) {
                logging && console.warn("Could not find file. Returning empty array");
                return [];
            }
            const userBooksStr = fs_1.default.readFileSync(dir, 'utf8');
            const userBooks = JSON.parse(userBooksStr);
            if (!Array.isArray(userBooks)) {
                console.warn(`Expected userBooks to be an array but got ${typeof userBooks}`);
                console.warn('Returning an empty array...');
                return [];
            }
            return userBooks;
        }
        catch (err) {
            console.warn("Could not find file");
            return [];
        }
    }
}
exports.default = ReadingList;
