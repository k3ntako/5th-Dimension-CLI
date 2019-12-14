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
const ReadingListManager_1 = __importDefault(require("./models/ReadingListManager"));
const User_1 = __importDefault(require("./models/User"));
const logging_1 = require("./utilities/logging");
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.loginAsDefault();
        const readingListManager = new ReadingListManager_1.default(user);
        readingListManager.start();
    }
    catch (err) {
        logging_1.error("Sorry, there was an unexpected error with the program.");
        logging_1.error("If the issue persists, please contact the developer.\n");
        logging_1.error(err);
        process.exit();
    }
});
start();
exports.default = start;
