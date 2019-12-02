"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_emoji_1 = __importDefault(require("node-emoji"));
const chalk_1 = __importDefault(require("chalk"));
const warn = (message) => console.warn(`${node_emoji_1.default.get('warning')}  ${chalk_1.default.keyword('orange')(message)}`);
exports.warn = warn;
const error = (message) => console.error(`${node_emoji_1.default.get('warning')}  ${chalk_1.default.keyword('red')(message)}`);
exports.error = error;
